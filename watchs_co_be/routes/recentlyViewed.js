const express = require("express");
const router = express.Router();
const recentlyViewedController = require("../controllers/recentlyViewedController");
const { optionalAuth } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { recentSchemas } = require("../validation/schemas");

// Recently viewed routes support both authenticated users and guest tokens
router.post(
  "/",
  optionalAuth,
  validateRequest(recentSchemas.add),
  recentlyViewedController.addItem
);
router.get("/", optionalAuth, recentlyViewedController.getRecentlyViewed);
router.delete(
  "/",
  optionalAuth,
  validateRequest(recentSchemas.clear),
  recentlyViewedController.clearRecentlyViewed
);

module.exports = router;
