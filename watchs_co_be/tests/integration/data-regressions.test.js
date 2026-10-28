const request = require("supertest");
const { randomUUID } = require("node:crypto");
const { Readable } = require("node:stream");
const app = require("../../app");
const db = require("../../db");
const { fixtures } = require("../helpers/fixtures");
const { importCSV } = require("../../scripts/importWatches");
const data = fixtures();
const address = { name: "Fixture Buyer", street: "1 Main St", city: "Test City", state: "CA", zip: "94105", country: "US" };
afterAll(() => data.cleanup());
const add = (agent, watch, quantity = 1, auth) => {
  const call = agent.post("/api/cart/items");
  if (auth) call.set("Authorization", auth);
  return call.send({ watch_id: watch.id, quantity });
};

test("merging overlapping bags consolidates quantities and retries do not add them again", async () => {
  const user = await data.user();
  const watch = await data.watch();
  await add(request(app), watch, 2, user.authorization).expect(200);
  const guest = request.agent(app);
  await guest.get("/api/cart").expect(200);
  await add(guest, watch).expect(200);
  const merged = await guest.post("/api/cart/merge").set("Authorization", user.authorization).send({}).expect(200);
  expect(merged.body.items).toHaveLength(1);
  expect(merged.body.items[0].quantity).toBe(3);
  const retry = await guest.post("/api/cart/merge").set("Authorization", user.authorization).send({}).expect(200);
  expect(retry.body.item_count).toBe(3);
});

test("a merge that exceeds stock rolls back all moves and can be retried after adjusting the account bag", async () => {
  const user = await data.user();
  const duplicate = await data.watch({ stock: 2 });
  const unique = await data.watch();
  const owned = await add(request(app), duplicate, 2, user.authorization).expect(200);
  const guest = request.agent(app);
  const first = await guest.get("/api/cart").expect(200);
  const guestCookie = first.headers["set-cookie"].map(value => value.split(";")[0]).join("; ");
  await add(guest, unique).expect(200);
  await add(guest, duplicate).expect(200);
  await guest.post("/api/cart/merge").set("Authorization", user.authorization).send({}).expect(409);
  const account = await request(app).get("/api/cart").set("Authorization", user.authorization).expect(200);
  expect(account.body.items.map(item => item.watch_id)).toEqual([duplicate.id]);
  const retained = await request(app).get("/api/cart").set("Cookie", guestCookie).expect(200);
  expect(retained.body.items).toHaveLength(2);
  await request(app).delete(`/api/cart/items/${owned.body.items[0].id}`).set("Authorization", user.authorization).expect(200);
  const retry = await guest.post("/api/cart/merge").set("Authorization", user.authorization).send({}).expect(200);
  expect(retry.body.item_count).toBe(2);
});

test("low-stock inventory can be added and its quantity changed", async () => {
  const watch = await data.watch({ status: "low_stock", stock: 3 });
  const guest = request.agent(app);
  const bag = await add(guest, watch).expect(200);
  const updated = await guest.put(`/api/cart/items/${bag.body.items[0].id}`).send({ quantity: 2 }).expect(200);
  expect(updated.body.item_count).toBe(2);
});

test("cart subtotals use current prices, including a zero price, just like checkout", async () => {
  const watch = await data.watch();
  const guest = request.agent(app);
  await add(guest, watch, 3).expect(200);
  await db.query("UPDATE watches SET sale_price=125.55 WHERE id=$1", [watch.id]);
  const repriced = await guest.get("/api/cart").expect(200);
  expect(repriced.body.subtotal).toBe(376.65);
  await db.query("UPDATE watches SET sale_price=0 WHERE id=$1", [watch.id]);
  const free = await guest.get("/api/cart").expect(200);
  expect(free.body.subtotal).toBe(0);
});

test("address CRUD supports absent phone numbers and both-purpose addresses", async () => {
  const user = await data.user();
  const created = await request(app).post("/api/account/addresses").set("Authorization", user.authorization)
    .send({ ...address, type: "both" }).expect(201);
  const changed = await request(app).put(`/api/account/addresses/${created.body.id}`).set("Authorization", user.authorization)
    .send({ ...address, name: "Edited Buyer", type: "both" }).expect(200);
  expect(changed.body.name).toBe("Edited Buyer");
  await request(app).put(`/api/account/addresses/${created.body.id}`).set("Authorization", user.authorization)
    .send({ phone: "5551234567", label: "Office", country: "GB" }).expect(200);
  const cleared = await request(app).put(`/api/account/addresses/${created.body.id}`).set("Authorization", user.authorization)
    .send({ phone: null, label: null }).expect(200);
  expect(cleared.body).toMatchObject({ phone: null, label: null, country: "GB" });
});

test("moving a default address clears the destination type's previous default", async () => {
  const user = await data.user();
  const create = type => request(app).post("/api/account/addresses").set("Authorization", user.authorization)
    .send({ ...address, type, is_default: true });
  const shipping = await create("shipping").expect(201);
  const billing = await create("billing").expect(201);
  await request(app).put(`/api/account/addresses/${shipping.body.id}`).set("Authorization", user.authorization)
    .send({ type: "billing", is_default: true }).expect(200);
  const rows = (await db.query("SELECT id FROM addresses WHERE user_id=$1 AND is_default=true", [user.id])).rows;
  expect(rows.map(row => row.id)).toEqual([shipping.body.id]);
  expect(rows.map(row => row.id)).not.toContain(billing.body.id);
});

test("recent history has one owner and returns the most recently viewed watches first", async () => {
  const user = await data.user();
  const agent = request.agent(app);
  await agent.get("/api/cart").expect(200); // Keep a guest cookie beside the authenticated identity.
  const ids = [];
  for (let index = 0; index < 3; index++) {
    const watch = await data.watch();
    ids.push(watch.id);
    await agent.post("/api/recently-viewed").set("Authorization", user.authorization).send({ watch_id: watch.id }).expect(200);
  }
  const result = await agent.get("/api/recently-viewed").set("Authorization", user.authorization).query({ limit: 2 }).expect(200);
  expect(result.body.map(item => item.watch_id)).toEqual(ids.slice(-2).reverse());
  expect(result.body.every(item => item.guest_token === null)).toBe(true);
});

test("order history includes the number of purchased units", async () => {
  const user = await data.user();
  const watch = await data.watch();
  await add(request(app), watch, 2, user.authorization).expect(200);
  await request(app).post("/api/orders").set("Authorization", user.authorization)
    .set("Idempotency-Key", randomUUID()).send({ shipping_address: address }).expect(201);
  const history = await request(app).get("/api/orders").set("Authorization", user.authorization).expect(200);
  expect(history.body.orders[0].item_count).toBe(2);
});

test("search totals count all matches independently of the requested page", async () => {
  const brand = `Search${randomUUID()}`;
  for (let index = 0; index < 3; index++) await data.watch({ brand });
  const first = await request(app).get(`/api/products/search/${brand}`).query({ limit: 2 }).expect(200);
  const second = await request(app).get(`/api/products/search/${brand}`).query({ page: 2, limit: 2 }).expect(200);
  expect(first.body.products).toHaveLength(2);
  expect(second.body.products).toHaveLength(1);
  expect(second.body.pagination).toMatchObject({ total: 3, totalPages: 2 });
});

test("CSV imports await every row, populate current columns, and roll back malformed input", async () => {
  const brand = `CSV${randomUUID()}`;
  const csv = "Brand,Model,Reference,Price,stock_quantity\n" + Array.from({ length: 6 }, (_, i) => `${brand},Watch ${i},Ref-${i},${i ? 125.5 : 0},2\n`).join("");
  expect(await importCSV(null, { input: Readable.from([csv]) })).toBe(6);
  const saved = (await db.query("SELECT * FROM watches WHERE brand=$1", [brand])).rows;
  data.watches.push(...saved.map(watch => watch.id));
  expect(saved).toHaveLength(6);
  expect(saved.every(watch => watch.slug && Number(watch.sale_price) >= 0)).toBe(true);
  const invalid = `Brand,Model,Price\n${brand},Valid,10\n${brand},,20\n`;
  await expect(importCSV(null, { input: Readable.from([invalid]) })).rejects.toThrow("CSV row 3");
  await expect(importCSV(null, { input: Readable.from([`Brand,Model,Price\n${brand},Blank,\n`]) })).rejects.toThrow("CSV row 2");
  await expect(importCSV(null, { input: Readable.from(['Brand,Model,Price\nFixture,"unterminated,10']) })).rejects.toThrow();
  await expect(importCSV(`/private/tmp/missing-watch-import-${randomUUID()}.csv`)).rejects.toThrow("ENOENT");
  expect((await db.query("SELECT count(*) FROM watches WHERE brand=$1", [brand])).rows[0].count).toBe("6");
});
