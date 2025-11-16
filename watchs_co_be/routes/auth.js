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

const router = express.Router();

// Apply rate limiting to auth endpoints
router.use(authRateLimiter);

router.post("/login", login);
router.post("/signup", passwordValidator, signup);
router.post("/refresh", refreshToken);
router.post("/password-reset/request", requestPasswordReset);
router.post("/password-reset", passwordValidator, resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/logout", requireAuth, logout);

module.exports = router;
