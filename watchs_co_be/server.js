const app = require("./app");
const logger = require("./utils/logger");

async function start() {
  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
}

start();
