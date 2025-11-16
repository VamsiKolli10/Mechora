const request = require("supertest");
const app = require("../../app");

describe("Health Check", () => {
  test("GET /health should return status ok", async () => {
    const response = await request(app)
      .get("/health")
      .expect(200);

    expect(response.body).toHaveProperty("status", "ok");
    expect(response.body).toHaveProperty("timestamp");
  });
});

