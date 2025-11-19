const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const { requireAuth, optionalAuth } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { wishlistSchemas } = require("../validation/schemas");

// All wishlist routes require authentication
router.get("/", requireAuth, wishlistController.getWishlist);
router.post(
  "/items",
  requireAuth,
  validateRequest(wishlistSchemas.add),
  wishlistController.addItem
);
router.delete(
  "/items/:watchId",
  requireAuth,
  validateRequest(wishlistSchemas.remove),
  wishlistController.removeItem
);
router.get(
  "/items/:watchId/check",
  optionalAuth,
  validateRequest(wishlistSchemas.remove),
  wishlistController.checkItem
);

module.exports = router;
