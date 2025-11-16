const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { requireAuth, optional } = require("../middleware/authMiddleware");

// Public routes (with optional auth for guest checkout)
router.post("/", optional, orderController.createOrder);
router.get("/number/:orderNumber", optional, orderController.getOrderByNumber);

// Authenticated routes
router.get("/", requireAuth, orderController.getUserOrders);
router.get("/:orderId", optional, orderController.getOrder);

// Admin routes (add admin check later)
router.put("/:orderId/status", requireAuth, orderController.updateOrderStatus);

module.exports = router;

