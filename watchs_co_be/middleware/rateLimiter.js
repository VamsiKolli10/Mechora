// Simple in-memory rate limiter
// In production, use Redis or a proper rate limiting library like express-rate-limit

const rateLimitStore = new Map();

const createRateLimiter = (windowMs, maxRequests) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, []);
    }

    const requests = rateLimitStore.get(key);
    
    // Remove old requests outside the window
    const recentRequests = requests.filter((timestamp) => timestamp > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        error: "Too many requests, please try again later",
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000),
      });
    }

    // Add current request
    recentRequests.push(now);
    rateLimitStore.set(key, recentRequests);

    // Clean up old entries periodically (every 5 minutes)
    if (Math.random() < 0.01) {
      for (const [k, v] of rateLimitStore.entries()) {
        const filtered = v.filter((timestamp) => timestamp > windowStart);
        if (filtered.length === 0) {
          rateLimitStore.delete(k);
        } else {
          rateLimitStore.set(k, filtered);
        }
      }
    }

    next();
  };
};

// Pre-configured rate limiters
const authRateLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes
const generalRateLimiter = createRateLimiter(60 * 1000, 100); // 100 requests per minute
const strictRateLimiter = createRateLimiter(60 * 1000, 10); // 10 requests per minute

module.exports = {
  createRateLimiter,
  authRateLimiter,
  generalRateLimiter,
  strictRateLimiter,
};

