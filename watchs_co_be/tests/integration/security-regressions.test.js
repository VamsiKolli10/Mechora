process.env.AUTH_RATE_LIMIT_MAX = "1000";
jest.mock("../../utils/mailer", () => ({
  sendEmailVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));
const request = require("supertest");
const { randomUUID } = require("node:crypto");
const { authenticator } = require("otplib");
const app = require("../../app");
const db = require("../../db");
const { fixtures } = require("../helpers/fixtures");
const { hashToken, generateRefreshToken } = require("../../utils/tokenUtils");
const { sendEmailVerificationEmail } = require("../../utils/mailer");
const data = fixtures();
const cookies = response => response.headers["set-cookie"].map(value => value.split(";")[0]).join("; ");
const login = user => request(app).post("/api/auth/login").send({ email: user.email, password: user.plainPassword });
const provider = identity => {
  process.env.SUPABASE_URL = "https://fixture.invalid";
  process.env.SUPABASE_ANON_KEY = "fixture-key";
  jest.spyOn(global, "fetch").mockResolvedValue({ ok: true, json: async () => ({
    email_confirmed_at: new Date().toISOString(), user_metadata: {}, ...identity,
  }) });
};
const exchange = body => request(app).post("/api/auth/supabase-session").send({ access_token: "fixture-provider-token", ...body });

afterEach(() => {
  jest.restoreAllMocks();
  process.env.SUPABASE_URL = "";
  process.env.SUPABASE_ANON_KEY = "";
});
afterAll(() => data.cleanup());

test("profiles expose no verification credentials, and stored hashes cannot verify email", async () => {
  const agent = request.agent(app);
  const email = `${randomUUID()}@example.com`;
  const signup = await agent.post("/api/auth/signup").send({ name: "Mailbox Test", email, password: "MailboxPassword123!" }).expect(201);
  data.users.push(signup.body.user.id);
  const profile = await agent.get("/api/account/profile").expect(200);
  for (const key of ["password", "refresh_token", "password_reset_token", "email_verification_token", "mfa_secret"]) {
    expect(profile.body).not.toHaveProperty(key);
  }
  const stored = (await db.query("SELECT email_verification_token FROM users WHERE id=$1", [signup.body.user.id])).rows[0].email_verification_token;
  await agent.post("/api/auth/verify-email").send({ token: stored }).expect(400);
  const original = sendEmailVerificationEmail.mock.calls.find(call => call[0] === email)[1];
  await agent.post("/api/auth/verify-email").send({ token: original }).expect(200);
});

test("password recovery consumes the original token once and revokes access and refresh sessions", async () => {
  const user = await data.user();
  const session = await login(user).expect(200);
  const token = randomUUID();
  await db.query("UPDATE users SET password_reset_token=$1,password_reset_expires=NOW()+interval '1 hour' WHERE id=$2", [hashToken(token), user.id]);
  await request(app).post("/api/auth/password-reset").send({ token: hashToken(token), password: "NewPassword123!" }).expect(400);
  const submissions = await Promise.all([1, 2].map(() => request(app).post("/api/auth/password-reset").send({ token, password: "NewPassword123!" })));
  expect(submissions.map(result => result.status).sort()).toEqual([200, 400]);
  await request(app).get("/api/users/me").set("Cookie", cookies(session)).expect(401);
  await request(app).post("/api/auth/refresh").set("Cookie", cookies(session)).send({}).expect(401);
});

test("changing a password revokes existing sessions", async () => {
  const user = await data.user();
  const session = await login(user).expect(200);
  await request(app).put("/api/account/password").set("Cookie", cookies(session))
    .send({ current_password: user.plainPassword, new_password: "ChangedPassword123!" }).expect(200);
  await request(app).get("/api/users/me").set("Cookie", cookies(session)).expect(401);
  await request(app).post("/api/auth/refresh").set("Cookie", cookies(session)).send({}).expect(401);
});

test("refresh rotation is unique, rejects replay, and does not revoke the winning refresh", async () => {
  expect(generateRefreshToken({ id: 1 })).not.toBe(generateRefreshToken({ id: 1 }));
  const user = await data.user();
  const first = await login(user).expect(200);
  const refreshed = await request(app).post("/api/auth/refresh").set("Cookie", cookies(first)).send({}).expect(200);
  await request(app).post("/api/auth/refresh").set("Cookie", cookies(first)).send({}).expect(401);
  await request(app).post("/api/auth/refresh").set("Cookie", cookies(refreshed)).send({}).expect(200);
});

test("an expired access token triggers refresh instead of silently selecting a guest cart", async () => {
  const user = await data.user();
  const session = await login(user).expect(200);
  const jwt = require("../../utils/jwt");
  const expired = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: -1 });
  await request(app).get("/api/cart").set("Authorization", `Bearer ${expired}`).set("Cookie", cookies(session)).expect(401);
  const refreshed = await request(app).post("/api/auth/refresh").set("Cookie", cookies(session)).send({}).expect(200);
  const bag = await request(app).get("/api/cart").set("Cookie", cookies(refreshed)).expect(200);
  expect(bag.body.user_id).toBe(user.id);
});

test("verified provider linking invalidates credentials and sessions from an unverified local signup", async () => {
  const user = await data.user({ verified: false, mfa: true, secret: authenticator.generateSecret() });
  provider({ id: randomUUID(), email: user.email });
  const linked = await exchange({}).expect(200);
  expect(linked.body.user).toMatchObject({ id: user.id, email_verified: true, mfa_enabled: false, auth_provider: "supabase" });
  await login(user).expect(401);
  await request(app).get("/api/users/me").set("Authorization", user.authorization).expect(401);
  await request(app).get("/api/users/me").set("Cookie", cookies(linked)).expect(200);
});

test("provider exchange requires the existing account's MFA code", async () => {
  const secret = authenticator.generateSecret();
  const user = await data.user({ mfa: true, secret });
  provider({ id: randomUUID(), email: user.email });
  const challenge = await exchange({}).expect(200);
  expect(challenge.body.requires_mfa).toBe(true);
  expect(challenge.headers["set-cookie"]).toBeUndefined();
  await exchange({ mfa_code: "not-an-otp" }).expect(400);
  const result = await exchange({ mfa_code: authenticator.generate(secret) }).expect(200);
  expect(result.body.user.mfa_enabled).toBe(true);
});

test("reinitializing enabled MFA leaves the existing factor intact", async () => {
  const secret = authenticator.generateSecret();
  const user = await data.user({ mfa: true, secret });
  await request(app).post("/api/account/mfa/setup").set("Authorization", user.authorization).send({}).expect(409);
  const stored = (await db.query("SELECT mfa_enabled,mfa_secret FROM users WHERE id=$1", [user.id])).rows[0];
  expect(stored).toEqual({ mfa_enabled: true, mfa_secret: secret });
});

test("provider password recovery can revoke all app sessions without creating a new session", async () => {
  const providerId = randomUUID();
  const user = await data.user({ providerId });
  provider({ id: providerId, email: user.email });
  await request(app).post("/api/auth/supabase-revoke").send({ access_token: "fixture" }).expect(200);
  await request(app).get("/api/users/me").set("Authorization", user.authorization).expect(401);
});

test("profile refresh returns saved names and clears verification on email changes", async () => {
  const user = await data.user();
  const email = `${randomUUID()}@example.com`;
  await request(app).put("/api/account/profile").set("Authorization", user.authorization).send({ name: "Updated Name", email }).expect(200);
  const me = await request(app).get("/api/users/me").set("Authorization", user.authorization).expect(200);
  expect(me.body.user).toMatchObject({ name: "Updated Name", email, email_verified: false });
  expect(sendEmailVerificationEmail).toHaveBeenCalledWith(email, expect.any(String));
});

test("administrative user responses exclude authentication fields", async () => {
  const admin = await data.user({ role: "admin" });
  const user = await data.user({ secret: authenticator.generateSecret() });
  for (const path of ["/api/users", `/api/users/${user.id}`]) {
    const result = await request(app).get(path).set("Authorization", admin.authorization).expect(200);
    for (const record of Array.isArray(result.body) ? result.body : [result.body]) {
      for (const field of ["password", "refresh_token", "mfa_secret", "email_verification_token", "password_reset_token", "session_version", "supabase_user_id"]) expect(record).not.toHaveProperty(field);
    }
  }
});

test("administrator password updates revoke user sessions and return only safe profile fields", async () => {
  const admin = await data.user({ role: "admin" });
  const user = await data.user();
  const session = await login(user).expect(200);
  const changed = await request(app).put(`/api/users/${user.id}`).set("Authorization", admin.authorization)
    .send({ password: "AdminChangedPassword123!" }).expect(200);
  expect(changed.body).not.toHaveProperty("supabase_user_id");
  await request(app).get("/api/users/me").set("Cookie", cookies(session)).expect(401);
  await request(app).post("/api/auth/refresh").set("Cookie", cookies(session)).send({}).expect(401);
});

test("asset updates reject SQL expressions in field names", async () => {
  const admin = await data.user({ role: "admin" });
  const watch = await data.watch();
  const asset = (await db.query("INSERT INTO assets(watch_id,url,type) VALUES($1,'original','video') RETURNING id", [watch.id])).rows[0];
  await request(app).put(`/api/assets/${asset.id}`).set("Authorization", admin.authorization)
    .send({ "url = (SELECT current_user), alt_text": "injected" }).expect(400);
  expect((await db.query("SELECT url FROM assets WHERE id=$1", [asset.id])).rows[0].url).toBe("original");
  await request(app).put(`/api/assets/${asset.id}`).set("Authorization", admin.authorization).send({}).expect(400);
  await request(app).put(`/api/assets/${asset.id}`).set("Authorization", admin.authorization)
    .send({ url: "updated" }).expect(200);
  expect((await db.query("SELECT type FROM assets WHERE id=$1", [asset.id])).rows[0].type).toBe("video");
});
