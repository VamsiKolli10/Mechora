const express = require("express");
const router = express.Router();
const assetController = require("../controllers/assetController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

// Public routes
router.get("/watch/:watchId", assetController.getAssetsByWatchId);
router.get("/:id", assetController.getAssetById);

// Protected routes (admin only - add admin check later)
router.post("/", requireAuth, requireAdmin, assetController.createAsset);
router.put("/:id", requireAuth, requireAdmin, assetController.updateAsset);
router.delete("/:id", requireAuth, requireAdmin, assetController.deleteAsset);

module.exports = router;
