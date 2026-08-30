const { getClient } = require("../db");
const cartRepository = require("../repositories/cartRepository");
const orderRepository = require("../repositories/orderRepository");
const productService = require("./productService");

const createHttpError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const calculateTotals = (subtotal) => {
  const numericSubtotal = parseFloat(subtotal) || 0;
  const taxAmount = Math.round(numericSubtotal * 0.08 * 100) / 100;
  const shippingAmount = numericSubtotal > 5000 ? 0 : 50;

  return {
    subtotal: numericSubtotal,
    taxAmount,
    shippingAmount,
  };
};

const resolveCartRecord = async ({ userId, guestToken }) => {
  if (userId) {
    return cartRepository.getOrCreateUserCart(userId);
  }

  if (guestToken) {
    return cartRepository.getOrCreateGuestCart(guestToken);
  }

  throw createHttpError("Cart not found", 400);
};

const createOrderFromCart = async (input, context = {}) => {
  const { userId = null, guestToken = null } = context;
  const { guest_email, shipping_address, billing_address, notes } = input;

  if (!shipping_address) {
    throw createHttpError("Shipping address is required", 400);
  }

  if (!userId && !guest_email) {
    throw createHttpError("Email is required for guest checkout", 400);
  }

  const cartRecord = await resolveCartRecord({ userId, guestToken });
  const client = await getClient();

  try {
    await client.query("BEGIN");

    const cart = await cartRepository.getCartWithItems(cartRecord.id, client);
    if (!cart) {
      throw createHttpError("Cart not found", 400);
    }

    if (!cart.items || cart.items.length === 0) {
      throw createHttpError("Cart is empty", 400);
    }

    const orderItems = await productService.reserveInventory(cart.items, client);
    const fallbackSubtotal = orderItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const totals = calculateTotals(cart.subtotal || fallbackSubtotal);

    const order = await orderRepository.createOrder(
      {
        user_id: userId || null,
        guest_email: guest_email || null,
        subtotal: totals.subtotal,
        tax_amount: totals.taxAmount,
        shipping_amount: totals.shippingAmount,
        shipping_address,
        billing_address: billing_address || shipping_address,
        notes,
      },
      client
    );

    await orderRepository.addOrderItems(order.id, orderItems, client);
    await cartRepository.clearCart(cart.id, client);
    await client.query("COMMIT");

    return orderRepository.getOrderById(order.id, userId);
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      // Keep the original checkout failure as the response error.
    }
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  calculateTotals,
  createOrderFromCart,
};
