const request = require("supertest");
const { randomUUID } = require("node:crypto");
const app = require("../../app");
const db = require("../../db");
const { generateAccessToken } = require("../../utils/tokenUtils");

const address = { name: "Test Buyer", street: "1 Test St", city: "Test City", state: "CA", zip: "94105", country: "US" };
const payload = { guest_email: "checkout-test@example.com", shipping_address: address };

describe("checkout requests on isolated PostgreSQL", () => {
  let watch;
  let owner;
  let stranger;
  beforeAll(async () => {
    watch = (await db.query(`INSERT INTO watches (brand, model, slug, sale_price, stock_quantity, stock_status, is_active)
      VALUES ('Test', 'Request Watch', $1, 1250.55, 1, 'in_stock', true) RETURNING *`, [randomUUID()])).rows[0];
    const users = await db.query(`INSERT INTO users (name, email, password) VALUES
      ('Owner', $1, 'not-a-login'), ('Stranger', $2, 'not-a-login') RETURNING id`,
      [`${randomUUID()}@example.com`, `${randomUUID()}@example.com`]);
    [owner, stranger] = users.rows.map(u => ({ id: u.id, token: generateAccessToken({ id: u.id, role: "customer" }) }));
  });
  afterAll(async () => {
    // These rows belong only to this suite; avoid clearing other fixtures.
    await db.query("DELETE FROM checkout_requests WHERE order_id IN (SELECT order_id FROM order_items WHERE watch_id = $1)", [watch.id]);
    await db.query("DELETE FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE watch_id = $1)", [watch.id]);
    await db.query("DELETE FROM cart_items WHERE watch_id = $1", [watch.id]);
    await db.query("DELETE FROM watches WHERE id = $1", [watch.id]);
    await db.query("DELETE FROM users WHERE id = ANY($1::int[])", [[owner.id, stranger.id]]);
  });
  async function cart(token) {
    const agent = request.agent(app);
    const get = agent.get("/api/cart");
    if (token) get.set("Authorization", `Bearer ${token}`);
    await get.expect(200);
    const add = agent.post("/api/cart/items").send({ watch_id: watch.id, quantity: 1 });
    if (token) add.set("Authorization", `Bearer ${token}`);
    await add.expect(200);
    return agent;
  }
  test("concurrent retries create one request, use current price and never reduce stock", async () => {
    const agent = await cart();
    await db.query("UPDATE watches SET sale_price = 1275.95 WHERE id = $1", [watch.id]);
    const key = randomUUID();
    const send = () => agent.post("/api/orders").set("Idempotency-Key", key).send(payload);
    const [first, retry] = await Promise.all([send(), send()]);
    expect(first.status).toBe(201);
    expect(retry.status).toBe(201);
    expect(first.body.id).toBe(retry.body.id);
    expect(Number(first.body.subtotal)).toBe(1275.95);
    expect(Number(first.body.tax_amount)).toBe(0);
    expect(Number(first.body.shipping_amount)).toBe(0);
    expect(Number(first.body.items[0].unit_price)).toBe(1275.95);
    expect((await db.query("SELECT stock_quantity FROM watches WHERE id = $1", [watch.id])).rows[0].stock_quantity).toBe(1);
    const different = await agent.post("/api/orders").set("Idempotency-Key", key).send({ ...payload, notes: "changed" });
    expect(different.status).toBe(409);
    await request(app).get(`/api/orders/${first.body.id}`).expect(401);
    await request(app).get(`/api/orders/${first.body.id}`).set("Authorization", `Bearer ${stranger.token}`).expect(404);
    await request(app).get(`/api/orders/number/${first.body.order_number}`).set("Authorization", `Bearer ${stranger.token}`).expect(404);
  });
  test("authenticated request is visible only to its owner", async () => {
    const agent = await cart(owner.token);
    const response = await agent.post("/api/orders").set("Authorization", `Bearer ${owner.token}`)
      .set("Idempotency-Key", randomUUID()).send({ shipping_address: address }).expect(201);
    await request(app).get(`/api/orders/${response.body.id}`).set("Authorization", `Bearer ${owner.token}`).expect(200);
    await request(app).get(`/api/orders/${response.body.id}`).set("Authorization", `Bearer ${stranger.token}`).expect(404);
  });
  test("concurrent distinct submissions cannot duplicate the same cart", async () => {
    const agent = await cart();
    const results = await Promise.all([1, 2].map(() => agent.post("/api/orders").set("Idempotency-Key", randomUUID()).send(payload)));
    expect(results.map(r => r.status).sort()).toEqual([201, 400]);
  });
  test("unavailable stock rolls back the request and preserves the bag", async () => {
    const agent = await cart();
    await db.query("UPDATE watches SET stock_quantity = 0 WHERE id = $1", [watch.id]);
    const before = (await db.query("SELECT count(*) FROM orders")).rows[0].count;
    await agent.post("/api/orders").set("Idempotency-Key", randomUUID()).send(payload).expect(409);
    expect((await db.query("SELECT count(*) FROM orders")).rows[0].count).toBe(before);
    const bag = await agent.get("/api/cart").expect(200);
    expect(bag.body.items).toHaveLength(1);
    await db.query("UPDATE watches SET stock_quantity = 1 WHERE id = $1", [watch.id]);
  });
  test("empty bags, invalid addresses and payment calls fail safely", async () => {
    const agent = request.agent(app);
    await agent.get("/api/cart").expect(200);
    await agent.post("/api/orders").send(payload).expect(400);
    await agent.post("/api/orders").send({ shipping_address: {} }).expect(400);
    await agent.post("/api/payments/intent").send({ order_id: 1 }).expect(503);
  });
});
