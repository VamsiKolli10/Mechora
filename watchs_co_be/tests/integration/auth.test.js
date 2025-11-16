const request = require("supertest");
const app = require("../../app");
const { query } = require("../../db");

// Test user data
const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "TestPassword123!",
};

let authToken;
let refreshToken;

beforeAll(async () => {
  // Clean up test data
  await query("DELETE FROM users WHERE email = $1", [testUser.email]);
});

afterAll(async () => {
  // Clean up test data
  await query("DELETE FROM users WHERE email = $1", [testUser.email]);
});

describe("Authentication API", () => {
  describe("POST /api/auth/signup", () => {
    test("should create a new user with valid data", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refresh_token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe(testUser.email.toLowerCase());
      expect(response.body.user.email_verified).toBe(false);

      authToken = response.body.token;
      refreshToken = response.body.refresh_token;
    });

    test("should reject signup with invalid password", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Test User 2",
          email: "test2@example.com",
          password: "weak",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("details");
    });

    test("should reject duplicate email", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send(testUser)
        .expect(400);

      expect(response.body.error).toContain("already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    test("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refresh_token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe(testUser.email.toLowerCase());

      authToken = response.body.token;
      refreshToken = response.body.refresh_token;
    });

    test("should reject login with invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword123!",
        })
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });

    test("should reject login with non-existent email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "SomePassword123!",
        })
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/refresh", () => {
    test("should refresh tokens with valid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({
          refresh_token: refreshToken,
        })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refresh_token");
      expect(response.body.token).not.toBe(authToken);
    });

    test("should reject invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({
          refresh_token: "invalid_token",
        })
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/password-reset/request", () => {
    test("should accept password reset request", async () => {
      const response = await request(app)
        .post("/api/auth/password-reset/request")
        .send({
          email: testUser.email,
        })
        .expect(200);

      expect(response.body).toHaveProperty("message");
    });

    test("should not reveal if email exists", async () => {
      const response = await request(app)
        .post("/api/auth/password-reset/request")
        .send({
          email: "nonexistent@example.com",
        })
        .expect(200);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /api/auth/logout", () => {
    test("should logout successfully with valid token", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("message");
    });

    test("should reject logout without token", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });
});

