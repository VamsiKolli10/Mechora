const winston = require("winston");

const isProduction = process.env.NODE_ENV === "production";

const redactSecrets = winston.format((info) => {
  const serialized = JSON.stringify(info);
  const redacted = serialized.replace(
    /("(?:authorization|cookie|password|token|secret|api[_-]?key)"\s*:\s*)"[^"]*"/gi,
    '$1"[REDACTED]"'
  );
  return JSON.parse(redacted);
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  defaultMeta: { service: "mechora-api" },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    redactSecrets(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

logger.stream = {
  write(message) {
    logger.info(message.trim(), { source: "http" });
  },
};

module.exports = logger;
