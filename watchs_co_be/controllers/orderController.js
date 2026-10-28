const orderRepository = require("../repositories/orderRepository");
const orderService = require("../services/orderService");
const { extractGuestToken, verifyGuestToken } = require("../utils/guestTokens");
const { AppError, asyncHandler } = require("../middleware/errorHandler");

// Create order from cart
exports.createOrder = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const providedGuestToken = req.body.guest_token;
  const guestContext = extractGuestToken(req);
  const guestToken =
    guestContext?.rawToken ||
    (providedGuestToken ? verifyGuestToken(providedGuestToken) : null);
  const fullOrder = await orderService.createOrderFromCart(req.body, {
    userId,
    guestToken,
    idempotencyKey: req.get("Idempotency-Key"),
  });

  res.status(201).json(fullOrder);
});

// Get order by ID
exports.getOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user?.id;
  const order = await orderRepository.getOrderById(orderId, userId);

  if (!order) {
    throw new AppError("Order not found", { statusCode: 404, code: "ORDER_NOT_FOUND" });
  }

  res.json(order);
});

// Get order by order number
exports.getOrderByNumber = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;
  const userId = req.user?.id;
  const order = await orderRepository.getOrderByOrderNumber(orderNumber, userId);

  if (!order) {
    throw new AppError("Order not found", { statusCode: 404, code: "ORDER_NOT_FOUND" });
  }

  res.json(order);
});

// Get user orders
exports.getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("Authentication required", { statusCode: 401, code: "AUTHENTICATION_REQUIRED" });
  }

  const options = {
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 20,
    status: req.query.status,
  };

  const result = await orderRepository.getUserOrders(userId, options);
  res.json(result);
});

// Update order status (admin only - add admin check later)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, notes } = req.body;
  const userId = req.user?.id;

  if (!status) {
    throw new AppError("Status is required", { statusCode: 400, code: "STATUS_REQUIRED" });
  }

  const currentOrder = await orderRepository.getOrderById(orderId);
  if (!currentOrder) {
    throw new AppError("Order not found", { statusCode: 404, code: "ORDER_NOT_FOUND" });
  }

  const updatedOrder = await orderRepository.updateOrderStatus(
    orderId,
    status,
    currentOrder.status,
    notes,
    userId
  );

  res.json(updatedOrder);
});
