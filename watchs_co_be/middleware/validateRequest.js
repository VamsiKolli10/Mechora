const { ZodError } = require("zod");

const formatError = (error) =>
  error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

const validateRequest = (schema = {}) => (req, res, next) => {
  try {
    if (schema.body) {
      req.body = schema.body.parse(req.body ?? {});
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query ?? {});
    }
    if (schema.params) {
      req.params = schema.params.parse(req.params ?? {});
    }
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: formatError(error),
      });
    }
    return next(error);
  }
};

module.exports = { validateRequest };
