const Stripe = require("stripe");
const orderRepository = require("../repositories/orderRepository");
const paymentRepository = require("../repositories/paymentRepository");
const logger = require("../utils/logger");

let stripeClient;

const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: process.env.STRIPE_API_VERSION || "2026-07-29.dahlia",
    });
  }

  return stripeClient;
};

const toCents = (amount) => {
  if (amount === null || amount === undefined) return 0;
  const numeric = typeof amount === "number" ? amount : parseFloat(amount);
  if (Number.isNaN(numeric)) return 0;
  return Math.round(numeric * 100);
};

const mapStripeStatus = (status) => {
  switch (status) {
    case "succeeded":
      return "succeeded";
    case "processing":
    case "requires_capture":
      return "processing";
    case "canceled":
      return "failed";
    case "requires_payment_method":
    case "requires_action":
    case "requires_confirmation":
    default:
      return "pending";
  }
};

const buildIntentResponse = (intent, payment) => ({
  client_secret: intent.client_secret,
  payment_intent_id: intent.id,
  payment_id: payment?.id || null,
  order_id: payment?.order_id || intent.metadata?.order_id || null,
  amount: intent.amount,
  currency: intent.currency,
  status: intent.status,
});

const assertOrderAccess = (order, userId, guestEmail) => {
  if (order.user_id) {
    if (!userId || order.user_id !== userId) {
      const error = new Error("Order not found");
      error.status = 404;
      throw error;
    }
    return;
  }

  if (!guestEmail || !order.guest_email) {
    const error = new Error("Guest email is required");
    error.status = 400;
    throw error;
  }

  if (order.guest_email.toLowerCase() !== guestEmail.toLowerCase()) {
    const error = new Error("Order not found");
    error.status = 404;
    throw error;
  }
};

const createPaymentIntent = async ({
  order_id,
  guest_email,
  payment_method = "card",
  userId,
}) => {
  const stripe = getStripeClient();
  if (!stripe) {
    const error = new Error("Stripe is not configured");
    error.status = 500;
    throw error;
  }

  const order = await paymentRepository.getOrderRowById(order_id);
  if (!order) {
    const error = new Error("Order not found");
    error.status = 404;
    throw error;
  }

  assertOrderAccess(order, userId, guest_email);

  if (order.status === "cancelled" || order.status === "refunded") {
    const error = new Error("Order is not eligible for payment");
    error.status = 400;
    throw error;
  }

  const existingPayment = await paymentRepository.getLatestPaymentForOrder(order.id);
  if (existingPayment?.payment_intent_id) {
    const intent = await stripe.paymentIntents.retrieve(
      existingPayment.payment_intent_id
    );
    const mappedStatus = mapStripeStatus(intent.status);

    if (mappedStatus === "succeeded") {
      const error = new Error("Order is already paid");
      error.status = 400;
      throw error;
    }

    if (existingPayment.status !== mappedStatus) {
      await paymentRepository.updatePaymentByIntentId(intent.id, {
        status: mappedStatus,
        transaction_id: intent.latest_charge || existingPayment.transaction_id,
        metadata: {
          stripe_status: intent.status,
          updated_from: "retrieve",
        },
      });
    }

    return buildIntentResponse(intent, existingPayment);
  }

  const amountCents = toCents(order.total_amount);
  if (!amountCents) {
    const error = new Error("Order total must be greater than 0");
    error.status = 400;
    throw error;
  }

  const currency = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();
  const intent = await stripe.paymentIntents.create(
    {
      amount: amountCents,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: String(order.id),
        order_number: order.order_number || "",
        user_id: order.user_id ? String(order.user_id) : "",
      },
    },
    { idempotencyKey: `order-${order.id}` }
  );

  const payment = await paymentRepository.createPayment({
    order_id: order.id,
    payment_intent_id: intent.id,
    payment_method,
    amount: parseFloat(order.total_amount),
    currency: currency.toUpperCase(),
    status: mapStripeStatus(intent.status),
    transaction_id: intent.latest_charge || null,
    metadata: {
      stripe_status: intent.status,
    },
  });

  return buildIntentResponse(intent, payment);
};

const handleWebhook = async ({ body, signature }) => {
  const stripe = getStripeClient();
  if (!stripe) {
    const error = new Error("Stripe is not configured");
    error.status = 500;
    throw error;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    const error = new Error("Stripe webhook secret is not configured");
    error.status = 500;
    throw error;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    logger.error("Stripe webhook signature verification failed:", error.message);
    error.status = 400;
    error.publicMessage = `Webhook Error: ${error.message}`;
    throw error;
  }

  const intent = event.data?.object;
  if (!intent?.id) {
    return { received: true };
  }

  const payment = await paymentRepository.getPaymentByIntentId(intent.id);
  if (!payment) {
    logger.warn("Stripe webhook received for unknown payment intent", intent.id);
    return { received: true };
  }

  const mappedStatus = mapStripeStatus(intent.status);
  await paymentRepository.updatePaymentByIntentId(intent.id, {
    status: mappedStatus,
    transaction_id: intent.latest_charge || payment.transaction_id,
    metadata: {
      stripe_status: intent.status,
      event_type: event.type,
    },
  });

  let targetStatus = null;
  let notes = null;

  if (intent.status === "succeeded") {
    targetStatus = "confirmed";
    notes = "Payment succeeded";
  } else if (intent.status === "processing") {
    targetStatus = "processing";
    notes = "Payment processing";
  } else if (intent.status === "canceled") {
    targetStatus = "cancelled";
    notes = "Payment canceled";
  } else if (intent.status === "requires_payment_method") {
    targetStatus = "pending";
    notes = "Payment requires a new method";
  } else if (intent.status === "requires_action") {
    targetStatus = "pending";
    notes = "Payment requires action";
  } else if (event.type === "payment_intent.payment_failed") {
    targetStatus = "pending";
    notes = "Payment failed";
  }

  if (targetStatus) {
    const order = await orderRepository.getOrderById(payment.order_id);
    if (order && order.status !== targetStatus) {
      await orderRepository.updateOrderStatus(
        order.id,
        targetStatus,
        order.status,
        notes,
        null
      );
    }
  }

  return { received: true };
};

module.exports = {
  assertOrderAccess,
  buildIntentResponse,
  createPaymentIntent,
  getStripeClient,
  handleWebhook,
  mapStripeStatus,
  toCents,
};
