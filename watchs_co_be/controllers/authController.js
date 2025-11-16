const bcrypt = require("bcrypt");
const UserModel = require("../models/userModel");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
} = require("../utils/tokenUtils");
const { query } = require("../db");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

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

      // TODO: Implement TOTP verification
      // For now, we'll skip MFA verification
      // const totp = require("totp-generator");
      // const isValid = totp.verify(mfa_code, user.mfa_secret);
      // if (!isValid) {
      //   return res.status(401).json({ error: "Invalid MFA code" });
      // }
    }

    // Reset failed login attempts
    await query(
      `UPDATE users 
       SET failed_login_attempts = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [user.id]
    );

    // Generate tokens
    const payload = { id: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token in database
    await query(
      `UPDATE users 
       SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [refreshToken, user.id]
    );

    res.json({
      token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        email_verified: user.email_verified,
        mfa_enabled: user.mfa_enabled,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12); // Increased rounds for better security
    const emailVerificationToken = generateEmailVerificationToken();

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
      [emailVerificationToken, user.id]
    );

    // Generate tokens
    const payload = { id: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await query(
      `UPDATE users 
       SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [refreshToken, user.id]
    );

    // TODO: Send email verification email
    // await sendEmailVerificationEmail(user.email, emailVerificationToken);

    res.status(201).json({
      token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        email_verified: false,
        mfa_enabled: false,
      },
      message: "Account created successfully. Please verify your email.",
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
};

const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    const decoded = verifyRefreshToken(refresh_token);

    if (!decoded) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Verify token exists in database
    const result = await query(
      "SELECT * FROM users WHERE id = $1 AND refresh_token = $2",
      [decoded.id, refresh_token]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const user = result.rows[0];

    // Generate new tokens
    const payload = { id: user.id, email: user.email };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Update refresh token in database
    await query(
      `UPDATE users 
       SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [newRefreshToken, user.id]
    );

    res.json({
      token: newAccessToken,
      refresh_token: newRefreshToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err);
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
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      `UPDATE users 
       SET password_reset_token = $1, password_reset_expires = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [resetToken, resetExpires, user.id]
    );

    // TODO: Send password reset email
    // await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      message: "If the email exists, a password reset link has been sent",
    });
  } catch (err) {
    console.error("Password reset request error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token and password are required" });
  }

  try {
    const result = await query(
      `SELECT * FROM users 
       WHERE password_reset_token = $1 
       AND password_reset_expires > NOW()`,
      [token]
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
    console.error("Password reset error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Verification token is required" });
  }

  try {
    const result = await query(
      `SELECT * FROM users 
       WHERE email_verification_token = $1`,
      [token]
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
    console.error("Email verification error:", err);
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
      console.error("Logout error:", err);
    }
  }

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
