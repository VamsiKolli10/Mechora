const express = require("express");
const {
  login,
  signup,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  logout,
} = require("../controllers/authController");
const { passwordValidator } = require("../middleware/passwordValidator");
const { authRateLimiter } = require("../middleware/rateLimiter");
const { requireAuth } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { authSchemas } = require("../validation/schemas");

const router = express.Router();

// Apply rate limiting to auth endpoints
router.use(authRateLimiter);

router.post("/login", validateRequest(authSchemas.login), login);
router.post(
  "/signup",
  validateRequest(authSchemas.signup),
  passwordValidator,
  signup
);
router.post("/refresh", validateRequest(authSchemas.refresh), refreshToken);
router.post(
  "/password-reset/request",
  validateRequest(authSchemas.requestPasswordReset),
  requestPasswordReset
);
router.post(
  "/password-reset",
  validateRequest(authSchemas.resetPassword),
  passwordValidator,
  resetPassword
);
router.post("/verify-email", validateRequest(authSchemas.verifyEmail), verifyEmail);
router.post("/logout", requireAuth, logout);

module.exports = router;
