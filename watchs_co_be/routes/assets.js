const express = require("express");
const router = express.Router();
const assetController = require("../controllers/assetController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { assetSchemas } = require("../validation/schemas");

// Public routes
router.get("/watch/:watchId", assetController.getAssetsByWatchId);
router.get("/:id", assetController.getAssetById);

// Protected routes (admin only - add admin check later)
router.post("/", requireAuth, requireAdmin, validateRequest(assetSchemas.create), assetController.createAsset);
router.put("/:id", requireAuth, requireAdmin, validateRequest(assetSchemas.update), assetController.updateAsset);
router.delete("/:id", requireAuth, requireAdmin, assetController.deleteAsset);

module.exports = router;
