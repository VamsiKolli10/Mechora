const express = require("express");
const router = express.Router();
const collectionController = require("../controllers/collectionController");
const { requireAuth } = require("../middleware/authMiddleware");

// Public routes
router.get("/", collectionController.getAllCollections);
router.get("/:id", collectionController.getCollectionById);
router.get("/slug/:slug", collectionController.getCollectionBySlug);

// Protected routes (admin only - add admin check later)
router.post("/", requireAuth, collectionController.createCollection);
router.put("/:id", requireAuth, collectionController.updateCollection);
router.delete("/:id", requireAuth, collectionController.deleteCollection);

module.exports = router;

