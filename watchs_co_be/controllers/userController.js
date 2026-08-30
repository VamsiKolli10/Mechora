const bcrypt = require("bcryptjs");
const UserModel = require("../models/userModel");
const { validatePassword } = require("../middleware/passwordValidator");

const getUsers = async (req, res) => {
  try {
    const result = await UserModel.getAllUsers();
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await UserModel.getUserById(id);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "customer" } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ error: "Password validation failed", details: passwordErrors });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await UserModel.createUser({ name, email, hashedPassword, role });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.password) {
      const passwordErrors = validatePassword(updates.password);
      if (passwordErrors.length > 0) {
        return res.status(400).json({ error: "Password validation failed", details: passwordErrors });
      }
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    const result = await UserModel.updateUser(id, updates);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to update user" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await UserModel.deleteUser(id);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

const getMe = (req, res) => {
  try {
    res.json({ message: "You are authorized", user: req.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
};
