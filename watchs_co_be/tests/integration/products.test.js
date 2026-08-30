const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../../app");
const { query } = require("../../db");
const UserModel = require("../../models/userModel");
const Watch = require("../../models/watchesModel");

const adminUser = {
  name: "Admin User",
  email: "admin-products@example.com",
  password: "AdminPassword123!",
};

const createdWatchIds = [];

const buildProductPayload = (overrides = {}) => {
  const timestamp = Date.now();
  return {
    brand: "Test Brand",
    model: `Test Model ${timestamp}`,
    reference: `REF-${timestamp}`,
    sku: `SKU-${timestamp}`,
    sale_price: 9500,
    msrp: 10500,
    stock_status: "in_stock",
    stock_quantity: 5,
    condition: "new",
    is_active: true,
    ...overrides,
  };
};

const createWatch = async (overrides = {}) => {
  const payload = buildProductPayload(overrides);
  const result = await Watch.insertWatch(payload);
  const watch = result.rows[0];
  await Watch.ensureSlugs([watch]);
  createdWatchIds.push(watch.id);
  return watch;
};

describe("Products API", () => {
  let adminAgent;

  beforeAll(async () => {
    await query("DELETE FROM users WHERE email = $1", [adminUser.email]);

    const hashedPassword = await bcrypt.hash(adminUser.password, 12);
    await UserModel.createUser({
      name: adminUser.name,
      email: adminUser.email,
      hashedPassword,
      role: "admin",
    });

    adminAgent = request.agent(app);
    await adminAgent
      .post("/api/auth/login")
      .send({ email: adminUser.email, password: adminUser.password })
      .expect(200);
  });

  afterAll(async () => {
    if (createdWatchIds.length > 0) {
      await query("DELETE FROM watches WHERE id = ANY($1::int[])", [createdWatchIds]);
    }
    await query("DELETE FROM users WHERE email = $1", [adminUser.email]);
  });

  test("GET /api/products returns a paginated list", async () => {
    const created = await createWatch();
    const response = await request(app)
      .get("/api/products")
      .expect(200);

    expect(response.body).toHaveProperty("products");
    expect(response.body).toHaveProperty("pagination");
    expect(Array.isArray(response.body.products)).toBe(true);
    expect(response.body.products.some((product) => product.id === created.id)).toBe(true);
  });

  test("GET /api/products/:id returns a product with assets", async () => {
    const created = await createWatch();
    const response = await request(app)
      .get(`/api/products/${created.id}`)
      .expect(200);

    expect(response.body).toHaveProperty("id", created.id);
    expect(Array.isArray(response.body.assets)).toBe(true);
  });

  test("GET /api/products/slug/:slug returns a product by slug", async () => {
    const created = await createWatch();
    const response = await request(app)
      .get(`/api/products/slug/${created.slug}`)
      .expect(200);

    expect(response.body).toHaveProperty("id", created.id);
    expect(response.body).toHaveProperty("slug", created.slug);
  });

  test("GET /api/products/search/:query returns matching products", async () => {
    const created = await createWatch({ model: "Searchable Model" });
    const response = await request(app)
      .get("/api/products/search/Searchable")
      .expect(200);

    expect(response.body).toHaveProperty("products");
    expect(response.body.products.some((product) => product.id === created.id)).toBe(true);
  });

  test("GET /api/products/suggestions returns suggestions", async () => {
    const created = await createWatch({ model: "Suggestable Model" });
    const response = await request(app)
      .get("/api/products/suggestions")
      .query({ q: "Suggest" })
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((product) => product.id === created.id)).toBe(true);
  });

  test("POST /api/products creates a product for admins", async () => {
    const payload = buildProductPayload({ model: "Admin Created Model" });
    const response = await adminAgent
      .post("/api/products")
      .send(payload)
      .expect(201);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("model", payload.model);
    createdWatchIds.push(response.body.id);
  });

  test("PUT /api/products/:id updates a product for admins", async () => {
    const created = await createWatch();
    const response = await adminAgent
      .put(`/api/products/${created.id}`)
      .send({ model: "Updated Product Model" })
      .expect(200);

    expect(response.body).toHaveProperty("id", created.id);
    expect(response.body).toHaveProperty("model", "Updated Product Model");
  });

  test("DELETE /api/products/:id deletes a product for admins", async () => {
    const created = await createWatch();
    const response = await adminAgent
      .delete(`/api/products/${created.id}`)
      .expect(200);

    expect(response.body).toHaveProperty("message", "Product deleted successfully");
  });
});
