const { randomUUID } = require("node:crypto");
const bcrypt = require("bcryptjs");
const db = require("../../db");
const { generateAccessToken } = require("../../utils/tokenUtils");

const fixtures = () => {
  const users = [];
  const watches = [];
  return {
    users, watches,
    async user(options = {}) {
      const password = "FixturePassword123!";
      const result = await db.query(
        `INSERT INTO users (name, email, password, role, email_verified, mfa_enabled, mfa_secret, supabase_user_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [options.name || "Fixture User", options.email || `${randomUUID()}@example.com`,
          await bcrypt.hash(password, 4), options.role || "customer", options.verified ?? true,
          options.mfa ?? false, options.secret || null, options.providerId || null]
      );
      const user = result.rows[0];
      users.push(user.id);
      return { ...user, plainPassword: password,
        authorization: `Bearer ${generateAccessToken({ id: user.id, session_version: user.session_version })}` };
    },
    async watch(options = {}) {
      const result = await db.query(
        `INSERT INTO watches (brand, model, slug, sale_price, stock_status, stock_quantity)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [options.brand || "Fixture", options.model || "Test Watch", randomUUID(), options.price ?? 100.25,
          options.status || "in_stock", options.stock ?? 10]
      );
      watches.push(result.rows[0].id);
      return result.rows[0];
    },
    async cleanup() {
      await db.query("DELETE FROM checkout_requests WHERE order_id IN (SELECT id FROM orders WHERE user_id = ANY($1::int[]))", [users]);
      await db.query("DELETE FROM orders WHERE user_id = ANY($1::int[])", [users]);
      await db.query("DELETE FROM users WHERE id = ANY($1::int[])", [users]);
      await db.query("DELETE FROM watches WHERE id = ANY($1::int[])", [watches]);
    },
  };
};
module.exports = { fixtures };
