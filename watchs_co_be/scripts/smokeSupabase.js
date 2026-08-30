require("dotenv").config();
const { query } = require("../db");

const apiBase = process.env.SMOKE_API_BASE_URL || "http://127.0.0.1:8002";
const runId = Date.now();
const email = `mechora-smoke-${runId}@example.com`;
const slug = `mechora-smoke-watch-${runId}`;

const assertResponse = async (response, label) => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${label} failed (${response.status}): ${JSON.stringify(body)}`);
  }
  return body;
};

const request = async (path, { method = "GET", body, cookie } = {}) => {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return response;
};

const cookieHeader = (response) =>
  response.headers
    .getSetCookie()
    .map((value) => value.split(";", 1)[0])
    .join("; ");

const cleanup = async () => {
  await query(
    `DELETE FROM orders
     WHERE id IN (
       SELECT DISTINCT oi.order_id
       FROM order_items oi
       JOIN watches w ON w.id = oi.watch_id
       WHERE w.slug = $1
     )`,
    [slug]
  );
  await query("DELETE FROM users WHERE email = $1", [email]);
  await query("DELETE FROM watches WHERE slug = $1", [slug]);
};

const main = async () => {
  let userId;
  let watchId;

  try {
    const brand = await query("SELECT id FROM brands ORDER BY id LIMIT 1");
    const collection = await query("SELECT id FROM collections ORDER BY id LIMIT 1");
    const watch = await query(
      `INSERT INTO watches (
         brand_id, collection_id, brand, model, reference, sku, slug,
         sale_price, stock_status, stock_quantity, condition,
         description, is_active, is_featured
       ) VALUES ($1, $2, 'Mechora', 'Smoke Test Watch', $3, $4, $5,
         1000, 'in_stock', 2, 'new', 'Temporary API verification item.', true, false)
       RETURNING id`,
      [brand.rows[0].id, collection.rows[0].id, `SMOKE-${runId}`, `SMOKE-${runId}`, slug]
    );
    watchId = watch.rows[0].id;

    const signupResponse = await request("/api/auth/signup", {
      method: "POST",
      body: {
        name: "Mechora Smoke Test",
        email,
        password: "MechoraSmoke1!",
      },
    });
    const signup = await assertResponse(signupResponse, "signup");
    const cookie = cookieHeader(signupResponse);
    userId = signup.user.id;

    await assertResponse(
      await request("/api/cart/items", {
        method: "POST",
        cookie,
        body: { watch_id: watchId, quantity: 1 },
      }),
      "cart add"
    );

    const cart = await assertResponse(
      await request("/api/cart", { cookie }),
      "cart read"
    );
    if (cart.item_count !== 1) throw new Error("cart item count did not match");

    await assertResponse(
      await request("/api/wishlist/items", {
        method: "POST",
        cookie,
        body: { watch_id: watchId },
      }),
      "wishlist add"
    );

    const wishlist = await assertResponse(
      await request("/api/wishlist", { cookie }),
      "wishlist read"
    );
    if (wishlist.length !== 1) throw new Error("wishlist item count did not match");

    const address = {
      name: "Mechora Smoke Test",
      street: "1 Test Way",
      city: "Portland",
      state: "OR",
      zip: "97205",
      country: "US",
      phone: "5035550100",
    };
    const order = await assertResponse(
      await request("/api/orders", {
        method: "POST",
        cookie,
        body: { shipping_address: address, billing_address: address },
      }),
      "order create"
    );

    const orderDetail = await assertResponse(
      await request(`/api/orders/${order.id}`, { cookie }),
      "order read"
    );
    if (orderDetail.items?.length !== 1) throw new Error("order item count did not match");

    const orders = await assertResponse(
      await request("/api/orders", { cookie }),
      "order history"
    );
    if (orders.orders?.length !== 1) throw new Error("order history count did not match");

    console.log({
      success: true,
      checks: ["signup", "cart", "wishlist", "checkout", "order detail", "order history"],
    });
  } finally {
    if (userId || watchId) await cleanup();
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error({ success: false, message: error.message });
    process.exit(1);
  });
