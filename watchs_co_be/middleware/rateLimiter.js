const rateLimit = require("express-rate-limit");

const readPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const buildLimiter = (options = {}) =>
  rateLimit({
    legacyHeaders: false,
    standardHeaders: "draft-8",
    skip: () => process.env.RATE_LIMIT_ENABLED === "false",
    handler: (req, res, next, rateLimitOptions) =>
      res.status(rateLimitOptions.statusCode).json({
        error: "Too many requests",
        message: rateLimitOptions.message,
        retry_after_seconds: Math.max(
          1,
          Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000)
        ),
      }),
    ...options,
  });

const authRateLimiter = buildLimiter({
  windowMs: readPositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  limit: readPositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 10),
  message: "Too many authentication attempts. Please try again later.",
  skipSuccessfulRequests: true,
});

const generalRateLimiter = buildLimiter({
  windowMs: readPositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60 * 1000),
  limit: readPositiveInt(process.env.RATE_LIMIT_MAX, 100),
  message: "Request limit exceeded. Please try again later.",
  skip: (req) =>
    process.env.RATE_LIMIT_ENABLED === "false" ||
    req.path === "/health" ||
    req.path === "/api/payments/webhook",
});

const strictRateLimiter = buildLimiter({
  windowMs: readPositiveInt(process.env.STRICT_RATE_LIMIT_WINDOW_MS, 60 * 1000),
  limit: readPositiveInt(process.env.STRICT_RATE_LIMIT_MAX, 10),
  message: "Request limit exceeded for this operation. Please try again later.",
});

module.exports = {
  buildLimiter,
  authRateLimiter,
  generalRateLimiter,
  strictRateLimiter,
  readPositiveInt,
};
