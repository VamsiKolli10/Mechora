const express = require("express");
const request = require("supertest");
const {
  createCorsMiddleware,
  createHelmetMiddleware,
  corsErrorHandler,
  parseAllowedOrigins,
} = require("../../../middleware/security");
const { buildLimiter, readPositiveInt } = require("../../../middleware/rateLimiter");

const createApp = ({ limiter } = {}) => {
  const app = express();
  app.use(createHelmetMiddleware());
  app.use(
    createCorsMiddleware({
      allowedOrigins: new Set(["https://shop.example.com"]),
    })
  );
  if (limiter) app.use(limiter);
  app.get("/resource", (req, res) => res.json({ ok: true }));
  app.use(corsErrorHandler);
  return app;
};

describe("security middleware", () => {
  test("sets security headers and allows configured origins", async () => {
    const response = await request(createApp())
      .get("/resource")
      .set("Origin", "https://shop.example.com")
      .expect(200);

    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://shop.example.com"
    );
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(response.headers["content-security-policy"]).toContain("default-src 'none'");
  });

  test("returns JSON for denied browser origins", async () => {
    const response = await request(createApp())
      .get("/resource")
      .set("Origin", "https://attacker.example")
      .expect(403);

    expect(response.body).toEqual({ error: "CORS origin denied" });
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  test("limits repeated requests and emits standard headers", async () => {
    const app = createApp({
      limiter: buildLimiter({ windowMs: 60_000, limit: 1 }),
    });

    await request(app).get("/resource").expect(200);
    const response = await request(app).get("/resource").expect(429);

    expect(response.body.error).toBe("Too many requests");
    expect(response.body.retry_after_seconds).toBeGreaterThan(0);
    expect(response.headers["ratelimit"]).toBeDefined();
  });

  test("normalizes origin lists and validates integer settings", () => {
    expect(parseAllowedOrigins("https://a.test/, https://b.test")).toEqual(
      new Set(["https://a.test", "https://b.test"])
    );
    expect(readPositiveInt("25", 10)).toBe(25);
    expect(readPositiveInt("invalid", 10)).toBe(10);
  });
});
