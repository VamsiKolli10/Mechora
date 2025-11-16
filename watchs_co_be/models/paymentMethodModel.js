const { query } = require("../db");

// Get all payment methods for user
const getUserPaymentMethods = async (userId) => {
  const result = await query(
    "SELECT * FROM payment_methods WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC",
    [userId]
  );
  return result.rows;
};

// Get payment method by ID
const getPaymentMethodById = async (id, userId) => {
  const result = await query(
    "SELECT * FROM payment_methods WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  return result.rows[0];
};

// Create payment method
const createPaymentMethod = async (paymentData) => {
  const {
    user_id,
    type,
    provider,
    provider_payment_method_id,
    last4,
    brand,
    expiry_month,
    expiry_year,
    is_default = false,
    metadata,
  } = paymentData;

  // If this is set as default, unset other defaults
  if (is_default) {
    await query(
      `UPDATE payment_methods 
       SET is_default = false, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1`,
      [user_id]
    );
  }

  const result = await query(
    `INSERT INTO payment_methods (
      user_id, type, provider, provider_payment_method_id, last4, brand,
      expiry_month, expiry_year, is_default, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      user_id,
      type,
      provider,
      provider_payment_method_id,
      last4,
      brand,
      expiry_month,
      expiry_year,
      is_default,
      metadata ? JSON.stringify(metadata) : null,
    ]
  );
  return result.rows[0];
};

// Update payment method
const updatePaymentMethod = async (id, userId, updates) => {
  // If setting as default, unset other defaults
  if (updates.is_default) {
    await query(
      `UPDATE payment_methods 
       SET is_default = false, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND id != $2`,
      [userId, id]
    );
  }

  const fields = Object.keys(updates);
  const values = Object.values(updates).map((v) =>
    typeof v === "object" ? JSON.stringify(v) : v
  );
  const setString = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const queryText = `UPDATE payment_methods SET ${setString}, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2} 
                     RETURNING *`;
  return query(queryText, [...values, id, userId]);
};

// Delete payment method
const deletePaymentMethod = async (id, userId) => {
  const result = await query(
    "DELETE FROM payment_methods WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, userId]
  );
  return result.rows[0];
};

// Set default payment method
const setDefaultPaymentMethod = async (id, userId) => {
  // Unset other defaults
  await query(
    `UPDATE payment_methods 
     SET is_default = false, updated_at = CURRENT_TIMESTAMP 
     WHERE user_id = $1 AND id != $2`,
    [userId, id]
  );

  // Set this as default
  const result = await query(
    `UPDATE payment_methods 
     SET is_default = true, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1 AND user_id = $2 
     RETURNING *`,
    [id, userId]
  );
  return result.rows[0];
};

module.exports = {
  getUserPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
};

