const { query } = require("../db");

const serializeMetadata = (metadata) => {
  if (!metadata) return null;
  if (typeof metadata === "string") return metadata;
  return JSON.stringify(metadata);
};

const createPayment = async ({
  order_id,
  payment_intent_id,
  payment_method = "card",
  amount,
  currency = "USD",
  status = "pending",
  transaction_id = null,
  metadata = null,
}) => {
  const result = await query(
    `INSERT INTO payments (
      order_id,
      payment_intent_id,
      payment_method,
      amount,
      currency,
      status,
      transaction_id,
      metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      order_id,
      payment_intent_id,
      payment_method,
      amount,
      currency,
      status,
      transaction_id,
      serializeMetadata(metadata),
    ]
  );
  return result.rows[0];
};

const getPaymentByIntentId = async (intentId) => {
  const result = await query(
    "SELECT * FROM payments WHERE payment_intent_id = $1",
    [intentId]
  );
  return result.rows[0];
};

const getLatestPaymentForOrder = async (orderId) => {
  const result = await query(
    `SELECT * FROM payments
     WHERE order_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [orderId]
  );
  return result.rows[0];
};

const updatePaymentByIntentId = async (intentId, updates = {}) => {
  const fields = Object.keys(updates);
  if (fields.length === 0) {
    return null;
  }

  const values = Object.values(updates).map((value, index) => {
    if (fields[index] === "metadata") {
      return serializeMetadata(value);
    }
    return value;
  });

  const setString = fields.map((field, idx) => `${field} = $${idx + 1}`).join(", ");
  const queryText = `UPDATE payments
                     SET ${setString}, updated_at = CURRENT_TIMESTAMP
                     WHERE payment_intent_id = $${fields.length + 1}
                     RETURNING *`;
  const result = await query(queryText, [...values, intentId]);
  return result.rows[0];
};

module.exports = {
  createPayment,
  getPaymentByIntentId,
  getLatestPaymentForOrder,
  updatePaymentByIntentId,
};
