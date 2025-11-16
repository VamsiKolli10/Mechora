const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const { requireAuth, optional } = require("../middleware/authMiddleware");

// All wishlist routes require authentication
router.get("/", requireAuth, wishlistController.getWishlist);
router.post("/items", requireAuth, wishlistController.addItem);
router.delete("/items/:watchId", requireAuth, wishlistController.removeItem);
router.get("/items/:watchId/check", optional, wishlistController.checkItem);

module.exports = router;

