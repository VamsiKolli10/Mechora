const express = require("express");
const router = express.Router();
const watchesController = require("../controllers/watchesController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { watchSchemas } = require("../validation/schemas");

// Public routes
router.get("/", validateRequest(watchSchemas.list), watchesController.getAllWatches);
router.get("/featured", watchesController.getFeaturedWatches);
router.get("/slug/:slug", watchesController.getWatchBySlug);
router.get("/search/:query", watchesController.searchWatches);
router.get("/:id", watchesController.getWatchById);

// Protected routes (admin only - add admin check later)
router.post(
  "/",
  requireAuth,
  requireAdmin,
  validateRequest(watchSchemas.create),
  watchesController.createWatch
);
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validateRequest(watchSchemas.update),
  watchesController.updateWatch
);
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validateRequest(watchSchemas.delete),
  watchesController.deleteWatch
);

module.exports = router;
