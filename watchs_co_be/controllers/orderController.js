const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Watch = require("../models/watchesModel");
const { extractGuestToken, verifyGuestToken } = require("../utils/guestTokens");

// Create order from cart
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    const providedGuestToken = req.body.guest_token;
    const guestContext = extractGuestToken(req);
    const guestToken =
      guestContext?.rawToken ||
      (providedGuestToken ? verifyGuestToken(providedGuestToken) : null);
    const {
      guest_email,
      shipping_address,
      billing_address,
      notes,
      tax_amount = 0,
      shipping_amount = 0,
    } = req.body;

    // Validate required fields
    if (!shipping_address) {
      return res.status(400).json({ error: "Shipping address is required" });
    }

    if (!userId && !guest_email) {
      return res.status(400).json({ error: "Email is required for guest checkout" });
    }

    // Get cart
    let cart;
    if (userId) {
      const userCart = await Cart.getOrCreateUserCart(userId);
      cart = await Cart.getCartWithItems(userCart.id);
    } else if (guestToken) {
      const guestCart = await Cart.getOrCreateGuestCart(guestToken);
      cart = await Cart.getCartWithItems(guestCart.id);
    } else {
      return res.status(400).json({ error: "Cart not found" });
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Validate stock and prepare order items
    const orderItems = [];
    for (const item of cart.items) {
      // Check stock
      if (item.stock_status !== "in_stock" || item.stock_quantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${item.brand} ${item.model}`,
        });
      }

      // Get watch snapshot
      const watchResult = await Watch.findById(item.watch_id);
      const watchSnapshot = watchResult.rows[0];

      orderItems.push({
        watch_id: item.watch_id,
        quantity: item.quantity,
        unit_price: parseFloat(item.price_at_added),
        watch_snapshot: {
          brand: watchSnapshot.brand,
          model: watchSnapshot.model,
          reference: watchSnapshot.reference,
          slug: watchSnapshot.slug,
          price: watchSnapshot.sale_price,
        },
      });
    }

    // Calculate subtotal
    const subtotal = cart.subtotal || orderItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );

    // Create order
    const order = await Order.createOrder({
      user_id: userId || null,
      guest_email: guest_email || null,
      subtotal,
      tax_amount: parseFloat(tax_amount),
      shipping_amount: parseFloat(shipping_amount),
      shipping_address,
      billing_address: billing_address || shipping_address,
      notes,
    });

    // Add order items
    await Order.addOrderItems(order.id, orderItems);

    // Clear cart
    await Cart.clearCart(cart.id);

    // Get full order details
    const fullOrder = await Order.getOrderById(order.id, userId);

    res.status(201).json(fullOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order by ID
exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    const order = await Order.getOrderById(orderId, userId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order by order number
exports.getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const userId = req.user?.id;

    const order = await Order.getOrderByOrderNumber(orderNumber, userId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status,
    };

    const result = await Order.getUserOrders(userId, options);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update order status (admin only - add admin check later)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user?.id;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    // Get current order to get previous status
    const currentOrder = await Order.getOrderById(orderId);
    if (!currentOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updatedOrder = await Order.updateOrderStatus(
      orderId,
      status,
      currentOrder.status,
      notes,
      userId
    );

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
