const request = require("supertest");
const app = require("../../app");
const { query } = require("../../db");

const GUEST_COOKIE_NAME = "mechora_guest_token";

describe("Cart API", () => {
  afterAll(async () => {
    await query("DELETE FROM cart_items");
    await query("DELETE FROM carts");
  });

  test("should mint a signed guest token when fetching a cart anonymously", async () => {
    const agent = request.agent(app);
    const response = await agent.get("/api/cart").expect(200);

    expect(response.body).toHaveProperty("guest_token");
    expect(Array.isArray(response.body.items)).toBe(true);

    const cookies = response.headers["set-cookie"] || [];
    expect(cookies.some((cookie) => cookie.startsWith(`${GUEST_COOKIE_NAME}=`))).toBe(true);
  });
});
