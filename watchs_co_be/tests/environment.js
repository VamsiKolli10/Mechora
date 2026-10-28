const { TestEnvironment } = require("jest-environment-node");

module.exports = class DatabaseTestEnvironment extends TestEnvironment {
  constructor(...args) {
    super(...args);
    this.databaseCleanups = new Set();
    this.global.__mechoraRegisterDatabaseCleanup = (close) => this.databaseCleanups.add(close);
  }

  async teardown() {
    try {
      // Jest has finished every suite-level and root-level fixture hook here.
      for (const close of this.databaseCleanups) await close();
    } finally {
      await super.teardown();
    }
  }
};
