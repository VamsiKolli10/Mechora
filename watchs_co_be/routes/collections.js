const express = require("express");
const router = express.Router();
const collectionController = require("../controllers/collectionController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { collectionSchemas } = require("../validation/schemas");

// Public routes
router.get("/", collectionController.getAllCollections);
router.get("/:id", collectionController.getCollectionById);
router.get("/slug/:slug", collectionController.getCollectionBySlug);

// Protected routes (admin only - add admin check later)
router.post(
  "/",
  requireAuth,
  requireAdmin,
  validateRequest(collectionSchemas.create),
  collectionController.createCollection
);
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validateRequest(collectionSchemas.update),
  collectionController.updateCollection
);
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validateRequest(collectionSchemas.update),
  collectionController.deleteCollection
);

module.exports = router;
