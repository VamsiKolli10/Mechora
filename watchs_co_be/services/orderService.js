const { getClient } = require("../db");
const cartRepository = require("../repositories/cartRepository");
const orderRepository = require("../repositories/orderRepository");
const productService = require("./productService");
const { createHash } = require("node:crypto");
const digest = (value) => createHash("sha256").update(value).digest("hex");

const createHttpError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const calculateTotals = (subtotal) => {
  const numericSubtotal = parseFloat(subtotal) || 0;
  // Order requests are not invoices. Tax and delivery are quoted on follow-up.
  const taxAmount = 0;
  const shippingAmount = 0;

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
  const requestKey = context.idempotencyKey;
  if (requestKey && !/^[A-Za-z0-9_-]{16,128}$/.test(requestKey)) {
    throw createHttpError("Invalid Idempotency-Key", 400);
  }

  if (!shipping_address) {
    throw createHttpError("Shipping address is required", 400);
  }

  if (!userId && !guest_email) {
    throw createHttpError("Email is required for guest checkout", 400);
  }

  const cartRecord = await resolveCartRecord({ userId, guestToken });
  const ownerHash = digest(userId ? `user:${userId}` : `guest:${guestToken}`);
  const payloadHash = digest(JSON.stringify({ guest_email, shipping_address, billing_address, notes }));
  const client = await getClient();
  let orderId;

  try {
    await client.query("BEGIN");

    // Serialize retries before checking the cart: a successful first request clears it.
    if (requestKey) {
      await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [ownerHash + requestKey]);
      const existing = await client.query(
        "SELECT order_id, payload_hash FROM checkout_requests WHERE owner_hash = $1 AND request_key = $2",
        [ownerHash, requestKey]
      );
      if (existing.rows.length) {
        if (existing.rows[0].payload_hash !== payloadHash) throw createHttpError("This request key was already used with different details", 409);
        orderId = existing.rows[0].order_id;
      }
    }

    if (!orderId) {
      const cart = await cartRepository.getCartWithItems(cartRecord.id, client);
      if (!cart) {
        throw createHttpError("Cart not found", 400);
      }

      if (!cart.items || cart.items.length === 0) {
        throw createHttpError("Cart is empty", 400);
      }

      const orderItems = await productService.snapshotAvailableItems(cart.items, client);
      const subtotalCents = orderItems.reduce(
        (sum, item) => sum + Math.round(item.unit_price * 100) * item.quantity,
        0
      );
      const totals = calculateTotals(subtotalCents / 100);

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
      if (requestKey) await client.query(
        "INSERT INTO checkout_requests (owner_hash, request_key, payload_hash, order_id) VALUES ($1, $2, $3, $4)",
        [ownerHash, requestKey, payloadHash, order.id]
      );
      await cartRepository.clearCart(cart.id, client);
      orderId = order.id;
    }
    await client.query("COMMIT");
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
  return orderRepository.getOrderById(orderId, userId);
};

module.exports = {
  calculateTotals,
  createOrderFromCart,
};
