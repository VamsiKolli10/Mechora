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
const updateUser = (id, { name }) => {
  return query(
    "UPDATE users SET name = LOWER(TRIM($1)) WHERE id = $2 RETURNING id, name",
    [name, id]
  );
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
