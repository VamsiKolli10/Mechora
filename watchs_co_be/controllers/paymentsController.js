const paymentService = require("../services/paymentService");
const logger = require("../utils/logger");

exports.createPaymentIntent = async (req, res) => {
  try {
    const intent = await paymentService.createPaymentIntent({
      ...req.body,
      userId: req.user?.id,
    });
    res.json(intent);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const result = await paymentService.handleWebhook({
      body: req.body,
      signature: req.headers["stripe-signature"],
    });
    return res.json(result);
  } catch (err) {
    if (err.status === 400 && err.publicMessage) {
      return res.status(400).send(err.publicMessage);
    }
    logger.error("Stripe webhook handling failed:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.status ? err.message : "Webhook processing failed" });
  }
};
