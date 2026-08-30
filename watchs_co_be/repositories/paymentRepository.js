const { query } = require("../db");
const Payment = require("../models/paymentModel");

const getOrderRowById = async (orderId) => {
  const result = await query("SELECT * FROM orders WHERE id = $1", [orderId]);
  return result.rows[0] || null;
};

module.exports = {
  createPayment: Payment.createPayment,
  getPaymentByIntentId: Payment.getPaymentByIntentId,
  getLatestPaymentForOrder: Payment.getLatestPaymentForOrder,
  updatePaymentByIntentId: Payment.updatePaymentByIntentId,
  getOrderRowById,
};
