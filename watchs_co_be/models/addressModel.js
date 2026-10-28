const { query } = require("../db");
const { withTransaction } = require("../utils/transaction");

// Get all addresses for user
const getUserAddresses = async (userId) => {
  const result = await query(
    "SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC",
    [userId]
  );
  return result.rows;
};

// Get address by ID
const getAddressById = async (id, userId) => {
  const result = await query(
    "SELECT * FROM addresses WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  return result.rows[0];
};

// Create address
const createAddress = (addressData) => withTransaction(async (client) => {
  await client.query("SELECT id FROM users WHERE id = $1 FOR UPDATE", [addressData.user_id]);
  const {
    user_id,
    type = "shipping",
    label,
    name,
    street,
    street2,
    city,
    state,
    zip,
    country = "US",
    phone,
    is_default = false,
  } = addressData;

  // If this is set as default, unset other defaults of the same type
  if (is_default) {
    await client.query(
      `UPDATE addresses 
       SET is_default = false, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND type = $2`,
      [user_id, type]
    );
  }

  const result = await client.query(
    `INSERT INTO addresses (
      user_id, type, label, name, street, street2, city, state, zip, country, phone, is_default
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [user_id, type, label, name, street, street2, city, state, zip, country, phone, is_default]
  );
  return result.rows[0];
});

// Update address
const updateAddress = (id, userId, updates) => withTransaction(async (client) => {
  await client.query("SELECT id FROM users WHERE id = $1 FOR UPDATE", [userId]);
  const current = (await client.query("SELECT * FROM addresses WHERE id = $1 AND user_id = $2 FOR UPDATE", [id, userId])).rows[0];
  if (!current) return { rows: [] };
  const fields = Object.keys(updates);
  if (!fields.length) throw Object.assign(new Error("No fields to update"), { status: 400 });
  const targetType = updates.type || current.type;
  const willBeDefault = updates.is_default ?? current.is_default;
  if (willBeDefault) {
    await client.query(
      "UPDATE addresses SET is_default = false, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND type = $2 AND id != $3",
      [userId, targetType, id]
    );
  }
  const assignments = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
  return client.query(
    `UPDATE addresses SET ${assignments}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2} RETURNING *`,
    [...Object.values(updates), id, userId]
  );
});

// Delete address
const deleteAddress = async (id, userId) => {
  const result = await query(
    "DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, userId]
  );
  return result.rows[0];
};

// Set default address
const setDefaultAddress = async (id, userId) => {
  const result = await updateAddress(id, userId, { is_default: true });
  if (!result.rows.length) throw Object.assign(new Error("Address not found"), { status: 404 });
  return result.rows[0];
};

module.exports = {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};

