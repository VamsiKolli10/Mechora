const express = require("express");
const router = express.Router();
const assetController = require("../controllers/assetController");
const { requireAuth } = require("../middleware/authMiddleware");

// Public routes
router.get("/watch/:watchId", assetController.getAssetsByWatchId);
router.get("/:id", assetController.getAssetById);

// Protected routes (admin only - add admin check later)
router.post("/", requireAuth, assetController.createAsset);
router.put("/:id", requireAuth, assetController.updateAsset);
router.delete("/:id", requireAuth, assetController.deleteAsset);

module.exports = router;

