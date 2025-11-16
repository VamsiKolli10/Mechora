const express = require("express");
const router = express.Router();
const recentlyViewedController = require("../controllers/recentlyViewedController");
const { optional } = require("../middleware/authMiddleware");

// Recently viewed routes support both authenticated users and guest tokens
router.post("/", optional, recentlyViewedController.addItem);
router.get("/", optional, recentlyViewedController.getRecentlyViewed);
router.delete("/", optional, recentlyViewedController.clearRecentlyViewed);

module.exports = router;

