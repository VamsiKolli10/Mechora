const crypto = require("crypto");
const logger = require("../utils/logger");

class AppError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = options.statusCode || 500;
    this.code = options.code || "INTERNAL_SERVER_ERROR";
    this.details = options.details;
    this.isOperational = options.isOperational !== false;
    this.expose = options.expose ?? this.statusCode < 500;
    if (options.cause) this.cause = options.cause;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const requestIdMiddleware = (req, res, next) => {
  const incomingId = req.get("x-request-id");
  const requestId =
    incomingId && /^[a-zA-Z0-9._:-]{1,128}$/.test(incomingId)
      ? incomingId
      : crypto.randomUUID();

  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
};

const notFoundHandler = (req, res, next) => {
  next(
    new AppError("The requested resource was not found.", {
      statusCode: 404,
      code: "NOT_FOUND",
    })
  );
};

const normalizeError = (error) => {
  if (error instanceof AppError) return error;

  if (error?.name === "ZodError") {
    return new AppError("Request validation failed.", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: error.issues?.map((issue) => ({
        path: issue.path?.join("."),
        message: issue.message,
      })),
      cause: error,
    });
  }

  if (error?.code === "23505") {
    return new AppError("A record with those details already exists.", {
      statusCode: 409,
      code: "CONFLICT",
      cause: error,
    });
  }

  if (error?.code === "23503" || error?.code === "23514") {
    return new AppError("The request conflicts with related data.", {
      statusCode: 409,
      code: "DATA_CONSTRAINT_ERROR",
      cause: error,
    });
  }

  const statusCode = Number(error?.statusCode || error?.status);
  if (statusCode >= 400 && statusCode < 500) {
    return new AppError(error.message || "The request could not be completed.", {
      statusCode,
      code: error.code || "REQUEST_ERROR",
      cause: error,
    });
  }

  return new AppError("An unexpected error occurred.", {
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    expose: false,
    isOperational: false,
    cause: error,
  });
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  const normalized = normalizeError(error);
  const originalError = normalized.cause || error;
  const logMethod = normalized.statusCode >= 500 ? "error" : "warn";

  logger[logMethod](normalized.message, {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
    statusCode: normalized.statusCode,
    errorCode: normalized.code,
    operational: normalized.isOperational,
    errorName: originalError?.name,
    stack: originalError?.stack,
  });

  const message = normalized.expose
    ? normalized.message
    : "An internal server error occurred.";
  const body = {
    error: {
      code: normalized.code,
      message,
      request_id: req.id,
    },
  };

  if (normalized.expose && normalized.details !== undefined) {
    body.error.details = normalized.details;
  }

  return res.status(normalized.statusCode).json(body);
};

module.exports = {
  AppError,
  asyncHandler,
  errorHandler,
  normalizeError,
  notFoundHandler,
  requestIdMiddleware,
};
