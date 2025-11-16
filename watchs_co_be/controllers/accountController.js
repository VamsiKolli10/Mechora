const UserModel = require("../models/userModel");
const Address = require("../models/addressModel");
const PaymentMethod = require("../models/paymentMethodModel");
const Order = require("../models/orderModel");
const { query } = require("../db");
const bcrypt = require("bcrypt");
const { passwordValidator } = require("../middleware/passwordValidator");

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await UserModel.getUserById(userId);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove sensitive fields
    delete user.password;
    delete user.refresh_token;
    delete user.password_reset_token;
    delete user.mfa_secret;

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const result = await UserModel.updateUser(userId, updates);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    delete user.password;
    delete user.refresh_token;

    res.json(user);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }

    // Validate new password
    const passwordErrors = require("../middleware/passwordValidator").validatePassword(new_password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        error: "Password validation failed",
        details: passwordErrors,
      });
    }

    // Get user and verify current password
    const result = await UserModel.getUserById(userId);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordValid = await bcrypt.compare(current_password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 12);

    // Update password
    await query(
      `UPDATE users 
       SET password = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [hashedPassword, userId]
    );

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get addresses
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.getUserAddresses(userId);
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create address
exports.createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const address = await Address.createAddress({ ...req.body, user_id: userId });
    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const result = await Address.updateAddress(addressId, userId, req.body);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const address = await Address.deleteAddress(addressId, userId);

    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Set default address
exports.setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const address = await Address.setDefaultAddress(addressId, userId);
    res.json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get payment methods
exports.getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentMethods = await PaymentMethod.getUserPaymentMethods(userId);
    res.json(paymentMethods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create payment method
exports.createPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    // TODO: Integrate with payment provider (Stripe, etc.) to create payment method
    // For now, we'll just store the data
    const paymentMethod = await PaymentMethod.createPaymentMethod({
      ...req.body,
      user_id: userId,
    });
    res.status(201).json(paymentMethod);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete payment method
exports.deletePaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethodId } = req.params;
    // TODO: Delete from payment provider as well
    const paymentMethod = await PaymentMethod.deletePaymentMethod(paymentMethodId, userId);

    if (!paymentMethod) {
      return res.status(404).json({ error: "Payment method not found" });
    }

    res.json({ message: "Payment method deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Set default payment method
exports.setDefaultPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethodId } = req.params;
    const paymentMethod = await PaymentMethod.setDefaultPaymentMethod(paymentMethodId, userId);
    res.json(paymentMethod);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order history
exports.getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status,
    };

    const result = await Order.getUserOrders(userId, options);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    const order = await Order.getOrderById(orderId, userId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

