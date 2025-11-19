const levels = ["debug", "info", "warn", "error"];
const levelPriority = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const currentLevel = process.env.LOG_LEVEL?.toLowerCase() || "info";

const shouldLog = (level) => {
  const requestedPriority = levelPriority[level] || levelPriority.info;
  const currentPriority = levelPriority[currentLevel] || levelPriority.info;
  return requestedPriority >= currentPriority;
};

const buildLogger = () => {
  const logger = {};
  levels.forEach((level) => {
    logger[level] = (...args) => {
      if (!shouldLog(level)) {
        return;
      }
      const timestamp = new Date().toISOString();
      // eslint-disable-next-line no-console
      console[level === "debug" ? "log" : level](`[${timestamp}] [${level.toUpperCase()}]`, ...args);
    };
  });

  logger.stream = {
    write: (message) => {
      logger.info(message.trim());
    },
  };

  return logger;
};

module.exports = buildLogger();
