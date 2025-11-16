const { query } = require("../db");

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
const createAddress = async (addressData) => {
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
    await query(
      `UPDATE addresses 
       SET is_default = false, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND type = $2`,
      [user_id, type]
    );
  }

  const result = await query(
    `INSERT INTO addresses (
      user_id, type, label, name, street, street2, city, state, zip, country, phone, is_default
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [user_id, type, label, name, street, street2, city, state, zip, country, phone, is_default]
  );
  return result.rows[0];
};

// Update address
const updateAddress = async (id, userId, updates) => {
  // If setting as default, unset other defaults
  if (updates.is_default) {
    const currentAddress = await getAddressById(id, userId);
    if (currentAddress) {
      await query(
        `UPDATE addresses 
         SET is_default = false, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1 AND type = $2 AND id != $3`,
        [userId, currentAddress.type, id]
      );
    }
  }

  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setString = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const queryText = `UPDATE addresses SET ${setString}, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2} 
                     RETURNING *`;
  return query(queryText, [...values, id, userId]);
};

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
  // Get address to determine type
  const address = await getAddressById(id, userId);
  if (!address) {
    throw new Error("Address not found");
  }

  // Unset other defaults of the same type
  await query(
    `UPDATE addresses 
     SET is_default = false, updated_at = CURRENT_TIMESTAMP 
     WHERE user_id = $1 AND type = $2 AND id != $3`,
    [userId, address.type, id]
  );

  // Set this as default
  const result = await query(
    `UPDATE addresses 
     SET is_default = true, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1 AND user_id = $2 
     RETURNING *`,
    [id, userId]
  );
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

