const bcrypt = require("bcrypt");
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
const { query } = require("../db");
const config = require("../config/secrets");
const logger = require("../utils/logger");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

authenticator.options = {
  window: 1,
};

const commonCookieOptions = {
  httpOnly: true,
  sameSite: config.cookies.sameSite,
  secure: config.cookies.secure,
  path: "/",
};

if (config.cookies.domain) {
  commonCookieOptions.domain = config.cookies.domain;
}

const buildCookieOptions = (maxAge) => ({
  ...commonCookieOptions,
  maxAge,
});

const setSessionCookies = (res, accessToken, refreshToken) => {
  res.cookie(
    config.cookies.access,
    accessToken,
    buildCookieOptions(config.cookies.accessMaxAgeMs)
  );
  res.cookie(
    config.cookies.refresh,
    refreshToken,
    buildCookieOptions(config.cookies.refreshMaxAgeMs)
  );
};

const clearSessionCookies = (res) => {
  res.clearCookie(config.cookies.access, commonCookieOptions);
  res.clearCookie(config.cookies.refresh, commonCookieOptions);
};

const buildUserPayload = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role || "customer",
});

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  email_verified: user.email_verified,
  mfa_enabled: user.mfa_enabled,
  role: user.role || "customer",
});

const sessionMetadata = () => ({
  access_expires_in_ms: config.cookies.accessMaxAgeMs,
  refresh_expires_in_ms: config.cookies.refreshMaxAgeMs,
});

const buildAndPersistTokens = async (user) => {
  const payload = buildUserPayload(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const hashedRefresh = hashToken(refreshToken);

  await query(
    `UPDATE users 
       SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
    [hashedRefresh, user.id]
  );

  return { accessToken, refreshToken };
};

const establishSession = async (user, res) => {
  const { accessToken, refreshToken } = await buildAndPersistTokens(user);
  setSessionCookies(res, accessToken, refreshToken);
  return sanitizeUser(user);
};

const login = async (req, res) => {
  const { email, password, mfa_code } = req.body;

  try {
    const result = await UserModel.findUserByEmail(email);
    const user = result.rows[0];

    if (!user) {
      // Don't reveal if user exists
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

    // Check MFA if enabled
    if (user.mfa_enabled) {
      if (!mfa_code) {
        return res.status(200).json({
          requires_mfa: true,
          message: "MFA code required",
        });
      }

      const isValidCode = authenticator.check(mfa_code, user.mfa_secret);
      if (!isValidCode) {
        return res.status(401).json({ error: "Invalid MFA code" });
      }
    }

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

    // TODO: Send email verification email
    // await sendEmailVerificationEmail(user.email, emailVerificationToken);

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
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    const decoded = verifyRefreshToken(refreshTokenValue);

    if (!decoded) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const result = await query("SELECT * FROM users WHERE id = $1", [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const user = result.rows[0];
    const incomingHash = hashToken(refreshTokenValue);

    if (!user.refresh_token || user.refresh_token !== incomingHash) {
      await query(
        `UPDATE users SET refresh_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [decoded.id]
      );
      clearSessionCookies(res);
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const sessionUser = await establishSession(user, res);

    res.json({
      user: sessionUser,
      session: sessionMetadata(),
    });
  } catch (err) {
    logger.error("Refresh token error:", err);
    res.status(500).json({ error: "Server error" });
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
    if (!user) {
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

    // TODO: Send password reset email
    // await sendPasswordResetEmail(user.email, resetToken);

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
       AND (password_reset_token = $1 OR password_reset_token = $2)`,
      [hashedToken, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const user = result.rows[0];
    const hashedPassword = await bcrypt.hash(password, 12);

    await query(
      `UPDATE users 
       SET password = $1, 
           password_reset_token = NULL, 
           password_reset_expires = NULL,
           failed_login_attempts = 0,
           locked_until = NULL,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

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
       WHERE email_verification_token = $1 OR email_verification_token = $2`,
      [hashedToken, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.json({ message: "Email already verified" });
    }

    await query(
      `UPDATE users 
       SET email_verified = true, 
           email_verification_token = NULL,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [user.id]
    );

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
         SET refresh_token = NULL, updated_at = CURRENT_TIMESTAMP 
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

module.exports = {
  login,
  signup,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  logout,
};
