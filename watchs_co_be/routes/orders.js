const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { requireAuth, optionalAuth, requireAdmin } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { orderSchemas } = require("../validation/schemas");

// Public routes (with optional auth for guest checkout)
router.post(
  "/",
  optionalAuth,
  validateRequest(orderSchemas.create),
  orderController.createOrder
);
router.get(
  "/number/:orderNumber",
  optionalAuth,
  validateRequest(orderSchemas.getOrderByNumber),
  orderController.getOrderByNumber
);

// Authenticated routes
router.get("/", requireAuth, orderController.getUserOrders);
router.get(
  "/:orderId",
  optionalAuth,
  validateRequest(orderSchemas.getOrder),
  orderController.getOrder
);

// Admin routes (add admin check later)
router.put(
  "/:orderId/status",
  requireAuth,
  requireAdmin,
  validateRequest(orderSchemas.updateStatus),
  orderController.updateOrderStatus
);

module.exports = router;
