const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config/secrets");

// Generate access token
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessTtl,
  });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshTtl,
  });
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (err) {
    return null;
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (err) {
    return null;
  }
};

// Generate random token for password reset, email verification, etc.
const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

// Generate secure token for password reset
const generatePasswordResetToken = () => {
  return generateRandomToken(32);
};

// Generate email verification token
const generateEmailVerificationToken = () => {
  return generateRandomToken(32);
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  generateRandomToken,
  hashToken,
};
