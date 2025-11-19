require("dotenv").config();
const logger = require("../utils/logger");
const { ensureAllSlugs } = require("../models/watchesModel");

async function runMaintenance() {
  try {
    const slugsBackfilled = await ensureAllSlugs();
    if (slugsBackfilled > 0) {
      logger.info(`[maintenance] Backfilled ${slugsBackfilled} watch slugs`);
    } else {
      logger.info("[maintenance] No slug backfill required");
    }
  } catch (err) {
    logger.error("[maintenance] Failed to run slug maintenance", err);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

runMaintenance();
