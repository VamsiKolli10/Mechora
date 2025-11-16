const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { requireAuth, optional } = require("../middleware/authMiddleware");

// All cart routes support both authenticated users and guest tokens
// Guest token should be passed in header: x-guest-token or query param: guest_token

router.get("/", optional, cartController.getCart);
router.post("/items", optional, cartController.addItem);
router.put("/items/:itemId", optional, cartController.updateItem);
router.delete("/items/:itemId", optional, cartController.removeItem);
router.delete("/", optional, cartController.clearCart);
router.post("/merge", requireAuth, cartController.mergeCart);

module.exports = router;

