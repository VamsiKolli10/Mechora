const rateLimit = require("express-rate-limit");

const buildLimiter = (options = {}) =>
  rateLimit({
    legacyHeaders: false,
    standardHeaders: true,
    ...options,
  });

const authRateLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: {
    error: "Too many auth attempts. Please wait a few minutes and try again.",
  },
});

const generalRateLimiter = buildLimiter({
  windowMs: 60 * 1000,
  limit: 100,
});

const strictRateLimiter = buildLimiter({
  windowMs: 60 * 1000,
  limit: 10,
});

module.exports = {
  buildLimiter,
  authRateLimiter,
  generalRateLimiter,
  strictRateLimiter,
};
