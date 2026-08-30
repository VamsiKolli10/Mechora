const cors = require("cors");
const helmet = require("helmet");

const DEFAULT_ORIGINS = ["http://localhost:5173", "http://localhost:3000"];

const parseAllowedOrigins = (value = process.env.CLIENT_ORIGIN) => {
  const origins = (value || DEFAULT_ORIGINS.join(","))
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  return new Set(origins);
};

const createCorsMiddleware = (options = {}) => {
  const allowedOrigins = options.allowedOrigins || parseAllowedOrigins();
  const isProduction = (process.env.NODE_ENV || "development") === "production";

  if (isProduction && allowedOrigins.has("*")) {
    throw new Error(
      "CLIENT_ORIGIN cannot contain '*' when credentialed CORS is enabled in production."
    );
  }

  return cors({
    origin(origin, callback) {
      // Requests without Origin are server-to-server, same-origin, or CLI requests.
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.has("*") || allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      }

      const error = new Error("Origin is not allowed by CORS policy.");
      error.status = 403;
      error.code = "CORS_ORIGIN_DENIED";
      return callback(error);
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Idempotency-Key", "X-Guest-Token"],
    exposedHeaders: ["RateLimit", "RateLimit-Policy", "Retry-After"],
    maxAge: 600,
    optionsSuccessStatus: 204,
  });
};

const createHelmetMiddleware = () =>
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        baseUri: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "no-referrer" },
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });

const corsErrorHandler = (error, req, res, next) => {
  if (error?.code !== "CORS_ORIGIN_DENIED") return next(error);

  return res.status(403).json({
    error: "CORS origin denied",
  });
};

module.exports = {
  createCorsMiddleware,
  createHelmetMiddleware,
  corsErrorHandler,
  parseAllowedOrigins,
};
