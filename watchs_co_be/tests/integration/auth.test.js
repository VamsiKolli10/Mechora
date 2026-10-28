const request = require("supertest");
const app = require("../../app");
const { query } = require("../../db");

const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "TestPassword123!",
};

const secondaryUserEmail = "test2@example.com";

const cookieNames = ["mechora_access_token", "mechora_refresh_token"];

const expectSessionCookies = (res) => {
  const cookies = res.headers["set-cookie"] || [];
  cookieNames.forEach((name) => {
    expect(cookies.some((cookie) => cookie.startsWith(`${name}=`))).toBe(true);
  });
};

const authenticateAgent = async () => {
  const agent = request.agent(app);
  await agent
    .post("/api/auth/login")
    .send({ email: testUser.email, password: testUser.password })
    .expect(200);
  return agent;
};

beforeAll(async () => {
  await query("DELETE FROM users WHERE email IN ($1, $2)", [testUser.email, secondaryUserEmail]);
});

afterAll(async () => {
  await query("DELETE FROM users WHERE email IN ($1, $2)", [testUser.email, secondaryUserEmail]);
});

describe("Authentication API", () => {
  describe("POST /api/auth/signup", () => {
    test("should create a new user with valid data", async () => {
      const signupAgent = request.agent(app);
      const response = await signupAgent
        .post("/api/auth/signup")
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("session");
      expect(response.body.user.email).toBe(testUser.email.toLowerCase());
      expect(response.body.user.email_verified).toBe(false);
      expectSessionCookies(response);
    });

    test("should reject signup with invalid password", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Test User 2",
          email: secondaryUserEmail,
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
    test("should login with valid credentials and issue cookies", async () => {
      const loginAgent = request.agent(app);
      const response = await loginAgent
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe(testUser.email.toLowerCase());
      expectSessionCookies(response);
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
    test("should refresh session when cookies are valid", async () => {
      const agent = await authenticateAgent();
      const response = await agent.post("/api/auth/refresh").send({}).expect(200);

      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("session");
      expectSessionCookies(response);
    });

    test("should reject invalid refresh token payload", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refresh_token: "invalid_token_long_enough" })
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/password-reset/request", () => {
    test("should accept password reset request", async () => {
      const response = await request(app)
        .post("/api/auth/password-reset/request")
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body).toHaveProperty("message");
    });

    test("should not reveal if email exists", async () => {
      const response = await request(app)
        .post("/api/auth/password-reset/request")
        .send({ email: "nonexistent@example.com" })
        .expect(200);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /api/auth/logout", () => {
    test("should logout successfully with a session cookie", async () => {
      const agent = await authenticateAgent();
      const response = await agent.post("/api/auth/logout").expect(200);
      expect(response.body).toHaveProperty("message");
    });

    test("should reject logout without authentication", async () => {
      const response = await request(app).post("/api/auth/logout").expect(401);
      expect(response.body).toHaveProperty("error");
    });
  });
});
