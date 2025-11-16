const express = require("express");
const router = express.Router();
const watchesController = require("../controllers/watchesController");
const { requireAuth } = require("../middleware/authMiddleware");

// Public routes
router.get("/", watchesController.getAllWatches);
router.get("/featured", watchesController.getFeaturedWatches);
router.get("/slug/:slug", watchesController.getWatchBySlug);
router.get("/search/:query", watchesController.searchWatches);
router.get("/:id", watchesController.getWatchById);

// Protected routes (admin only - add admin check later)
router.post("/", requireAuth, watchesController.createWatch);
router.put("/:id", requireAuth, watchesController.updateWatch);
router.delete("/:id", requireAuth, watchesController.deleteWatch);

module.exports = router;
