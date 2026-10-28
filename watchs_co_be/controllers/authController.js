const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { authenticator } = require("otplib");
const UserModel = require("../models/userModel");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  hashToken,
} = require("../utils/tokenUtils");
const { query, getClient } = require("../db");
const config = require("../config/secrets");
const logger = require("../utils/logger");
const {
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/mailer");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

authenticator.options = {
  window: 1,
};

const { sanitizeUser } = require("../utils/userPayload");
const { setSessionCookies, clearSessionCookies } = require("../utils/sessionCookies");
const { verifiedSupabaseIdentity } = require("../utils/supabaseIdentity");

const buildUserPayload = (user) => ({
  id: user.id,
  session_version: Number(user.session_version || 0),
});

const sessionMetadata = () => ({
  access_expires_in_ms: config.cookies.accessMaxAgeMs,
  refresh_expires_in_ms: config.cookies.refreshMaxAgeMs,
});

const buildAndPersistTokens = async (user, client = null, expectedRefreshHash = null) => {
  const payload = buildUserPayload(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const params = [hashToken(refreshToken), user.id, payload.session_version];
  let predicate = "id = $2 AND session_version = $3";
  if (expectedRefreshHash) {
    params.push(expectedRefreshHash);
    predicate += " AND refresh_token = $4";
  }
  const dbQuery = client ? client.query.bind(client) : query;
  const result = await dbQuery(
    `UPDATE users SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP
     WHERE ${predicate} RETURNING id`, params
  );
  if (!result.rows.length) throw Object.assign(new Error("Session has changed. Please sign in again."), { status: 401 });
  return { accessToken, refreshToken };
};

const establishSession = async (user, res, expectedRefreshHash = null) => {
  const { accessToken, refreshToken } = await buildAndPersistTokens(user, null, expectedRefreshHash);
  setSessionCookies(res, accessToken, refreshToken);
  return sanitizeUser(user);
};

const respondToMfa = (user, code, res) => {
  if (!user.mfa_enabled) return false;
  if (!code) {
    res.json({ requires_mfa: true, message: "Enter the code from your authenticator app." });
    return true;
  }
  if (!authenticator.check(code, user.mfa_secret)) {
    res.status(401).json({ error: "Invalid MFA code" });
    return true;
  }
  return false;
};

const login = async (req, res) => {
  const { email, password, mfa_code } = req.body;

  try {
    const result = await UserModel.findUserByEmail(email);
    const user = result.rows[0];

    if (!user || user.supabase_user_id) {
      // Linked accounts authenticate through their verified identity provider.
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const lockoutMinutes = Math.ceil(
        (new Date(user.locked_until) - new Date()) / 60000
      );
      return res.status(423).json({
        error: `Account is locked. Please try again in ${lockoutMinutes} minute(s)`,
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      // Increment failed login attempts
      const newAttempts = (user.failed_login_attempts || 0) + 1;
      let lockedUntil = null;

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
      }

      await query(
        `UPDATE users 
         SET failed_login_attempts = $1, locked_until = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3`,
        [newAttempts, lockedUntil, user.id]
      );

      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (respondToMfa(user, mfa_code, res)) return;

    // Reset failed login attempts
    await query(
      `UPDATE users 
       SET failed_login_attempts = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [user.id]
    );

    const sessionUser = await establishSession(user, res);
    res.json({
      user: sessionUser,
      session: sessionMetadata(),
    });
  } catch (err) {
    logger.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12); // Increased rounds for better security
    const emailVerificationToken = generateEmailVerificationToken();
    const hashedEmailVerificationToken = hashToken(emailVerificationToken);

    const result = await UserModel.createUser({
      name,
      hashedPassword,
      email,
    });

    const user = result.rows[0];

    // Store email verification token
    await query(
      `UPDATE users 
       SET email_verification_token = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [hashedEmailVerificationToken, user.id]
    );

    try {
      await sendEmailVerificationEmail(user.email, emailVerificationToken);
    } catch (emailErr) {
      logger.error("Email verification send failed:", emailErr.message);
    }

    const sessionUser = await establishSession(user, res);

    res.status(201).json({
      user: sessionUser,
      session: sessionMetadata(),
      message: "Account created successfully. Please verify your email.",
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    logger.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
};

const refreshToken = async (req, res) => {
  const cookieToken = req.cookies?.[config.cookies.refresh];
  const bodyToken = req.body?.refresh_token;
  const refreshTokenValue = cookieToken || bodyToken;

  if (!refreshTokenValue) {
    clearSessionCookies(res);
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    const decoded = verifyRefreshToken(refreshTokenValue);

    if (!decoded) {
      clearSessionCookies(res);
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const result = await query("SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL", [decoded.id]);

    if (result.rows.length === 0) {
      clearSessionCookies(res);
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const user = result.rows[0];
    const incomingHash = hashToken(refreshTokenValue);

    if (!user.refresh_token || user.refresh_token !== incomingHash ||
        Number(decoded.session_version || 0) !== user.session_version) {
      clearSessionCookies(res);
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const sessionUser = await establishSession(user, res, incomingHash);

    res.json({
      user: sessionUser,
      session: sessionMetadata(),
    });
  } catch (err) {
    logger.error("Refresh token error:", err);
    res.status(err.status || 500).json({ error: err.status === 401 ? err.message : "Server error" });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const result = await UserModel.findUserByEmail(email);
    const user = result.rows[0];

    // Don't reveal if user exists
    if (!user || user.supabase_user_id) {
      return res.json({
        message: "If the email exists, a password reset link has been sent",
      });
    }

    const resetToken = generatePasswordResetToken();
    const hashedResetToken = hashToken(resetToken);
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      `UPDATE users 
       SET password_reset_token = $1, password_reset_expires = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [hashedResetToken, resetExpires, user.id]
    );

    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailErr) {
      logger.error("Password reset email send failed:", emailErr.message);
    }

    res.json({
      message: "If the email exists, a password reset link has been sent",
    });
  } catch (err) {
    logger.error("Password reset request error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token and password are required" });
  }

  try {
    const hashedToken = hashToken(token);
    const result = await query(
      `SELECT * FROM users 
       WHERE password_reset_expires > NOW()
       AND password_reset_token = $1 AND deleted_at IS NULL AND supabase_user_id IS NULL`,
      [hashedToken]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const user = result.rows[0];
    const hashedPassword = await bcrypt.hash(password, 12);

    const changed = await query(
      `UPDATE users 
       SET password = $1, 
           password_reset_token = NULL, 
           password_reset_expires = NULL,
           refresh_token = NULL,
           session_version = session_version + 1,
           failed_login_attempts = 0,
           locked_until = NULL,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND password_reset_token = $3 AND password_reset_expires > NOW()
       RETURNING id`,
      [hashedPassword, user.id, hashedToken]
    );

    if (!changed.rows.length) return res.status(400).json({ error: "Invalid or expired reset token" });
    clearSessionCookies(res);
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    logger.error("Password reset error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Verification token is required" });
  }

  try {
    const hashedToken = hashToken(token);
    const result = await query(
      `SELECT * FROM users 
       WHERE email_verification_token = $1 AND deleted_at IS NULL`,
      [hashedToken]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.json({ message: "Email already verified" });
    }

    const changed = await query(
      `UPDATE users 
       SET email_verified = true, 
           email_verification_token = NULL,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND email_verification_token = $2 RETURNING id`,
      [user.id, hashedToken]
    );
    if (!changed.rows.length) return res.status(400).json({ error: "Invalid verification token" });

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    logger.error("Email verification error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const logout = async (req, res) => {
  const userId = req.user?.id;

  if (userId) {
    try {
      await query(
        `UPDATE users 
         SET refresh_token = NULL, session_version = session_version + 1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [userId]
      );
    } catch (err) {
      logger.error("Logout error:", err);
    }
  }

  clearSessionCookies(res);
  res.json({ message: "Logged out successfully" });
};

// Exchange a verified Supabase Auth session for the app's existing HttpOnly cookies.
// This lets the rest of the API continue using its established session contract.
const supabaseSession = async (req, res) => {
  const { access_token: accessToken, mfa_code } = req.body;

  let client;
  try {
    const identity = await verifiedSupabaseIdentity(accessToken);
    const email = identity.email;

    client = await getClient();
    await client.query("BEGIN");
    let { rows } = await client.query(
      `SELECT * FROM users WHERE supabase_user_id = $1 OR LOWER(email::text) = $2
       ORDER BY CASE WHEN supabase_user_id = $1 THEN 0 ELSE 1 END LIMIT 1 FOR UPDATE`,
      [identity.id, email]
    );
    let user = rows[0];
    if (user?.deleted_at || (user?.supabase_user_id && user.supabase_user_id !== identity.id)) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Email is linked to another identity" });
    }
    const reclaim = user && !user.supabase_user_id && !user.email_verified;
    if (user && !reclaim && respondToMfa(user, mfa_code, res)) {
      await client.query("ROLLBACK");
      return;
    }
    if (!user) {
      const result = await UserModel.createUser({
        name: String(identity.user_metadata?.name || email.split("@")[0]).slice(0, 255),
        hashedPassword: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12),
        email, supabaseUserId: identity.id, emailVerified: true,
      }, client);
      user = result.rows[0];
    } else if (!user.supabase_user_id) {
      // Verified provider ownership replaces every credential from an unverified signup.
      const password = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
      ({ rows } = await client.query(
        `UPDATE users SET supabase_user_id = $1, email_verified = true, password = $2,
           refresh_token = NULL, password_reset_token = NULL, password_reset_expires = NULL,
           email_verification_token = NULL, session_version = session_version + 1,
           mfa_enabled = CASE WHEN $3 THEN false ELSE mfa_enabled END,
           mfa_secret = CASE WHEN $3 THEN NULL ELSE mfa_secret END,
           updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`,
        [identity.id, password, Boolean(reclaim), user.id]
      ));
      user = rows[0];
    } else {
      ({ rows } = await client.query(
        `UPDATE users SET email = $1, email_verified = true, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 RETURNING *`, [email, user.id]
      ));
      user = rows[0];
    }
    const tokens = await buildAndPersistTokens(user, client);
    await client.query("COMMIT");
    setSessionCookies(res, tokens.accessToken, tokens.refreshToken);
    return res.json({ user: sanitizeUser(user), session: sessionMetadata() });
  } catch (err) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    logger.error("Supabase session exchange error", { message: err.message });
    return res.status(err.code === "23505" ? 409 : err.status || 500).json({ error: "Unable to establish session" });
  } finally {
    client?.release();
  }
};

const revokeSupabaseSessions = async (req, res) => {
  try {
    const identity = await verifiedSupabaseIdentity(req.body.access_token);
    await query(
      `UPDATE users SET refresh_token = NULL, session_version = session_version + 1,
       updated_at = CURRENT_TIMESTAMP WHERE supabase_user_id = $1`, [identity.id]
    );
    clearSessionCookies(res);
    res.json({ message: "Application sessions revoked" });
  } catch (error) {
    res.status(error.status || 500).json({ error: "Unable to revoke sessions" });
  }
};

module.exports = {
  login,
  signup,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  logout,
  supabaseSession,
  revokeSupabaseSessions,
};
