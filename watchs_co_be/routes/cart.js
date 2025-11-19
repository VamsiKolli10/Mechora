const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { requireAuth, optionalAuth } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { cartSchemas } = require("../validation/schemas");

// All cart routes support both authenticated users and guest tokens
// Guest token should be passed in header: x-guest-token or query param: guest_token

router.get("/", optionalAuth, cartController.getCart);
router.post(
  "/items",
  optionalAuth,
  validateRequest(cartSchemas.addItem),
  cartController.addItem
);
router.put(
  "/items/:itemId",
  optionalAuth,
  validateRequest(cartSchemas.updateItem),
  cartController.updateItem
);
router.delete(
  "/items/:itemId",
  optionalAuth,
  validateRequest(cartSchemas.removeItem),
  cartController.removeItem
);
router.delete("/", optionalAuth, cartController.clearCart);
router.post(
  "/merge",
  requireAuth,
  validateRequest(cartSchemas.mergeCart),
  cartController.mergeCart
);

module.exports = router;
