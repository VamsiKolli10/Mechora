const { query } = require("../db");

// GET all users
const getAllUsers = () => {
  return query("SELECT * FROM users ORDER BY id ASC");
};

// GET user by ID
const getUserById = (id) => {
  return query("SELECT * FROM users WHERE id = $1", [id]);
};

// CREATE user
const createUser = ({ name, hashedPassword, email }) => {
  return query(
    "INSERT INTO users (name, password, email, branch_id) VALUES (LOWER(TRIM($1)), $2, LOWER(TRIM($3)), $4) RETURNING id, name, email",
    [name, hashedPassword, email, 1]
  );
};

// UPDATE user
const updateUser = (id, updates) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  
  // Handle email and name with LOWER(TRIM())
  const setParts = fields.map((field, index) => {
    if (field === "email" || field === "name") {
      return `${field} = LOWER(TRIM($${index + 1}))`;
    }
    return `${field} = $${index + 1}`;
  });
  
  const setString = setParts.join(", ");
  const queryText = `UPDATE users SET ${setString}, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $${fields.length + 1} 
                     RETURNING id, name, email, created_at, updated_at, email_verified, mfa_enabled`;
  return query(queryText, [...values, id]);
};

// DELETE user
const deleteUser = (id) => {
  return query("DELETE FROM users WHERE id = $1 RETURNING id, name", [id]);
};

// FIND user by email
const findUserByEmail = (email) => {
  return query("SELECT * FROM users WHERE email = $1", [email]);
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  findUserByEmail,
};
