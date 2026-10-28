const UserModel = require("../models/userModel");
const Address = require("../models/addressModel");
const PaymentMethod = require("../models/paymentMethodModel");
const Order = require("../models/orderModel");
const { query } = require("../db");
const bcrypt = require("bcryptjs");
const { authenticator } = require("otplib");
const { validatePassword } = require("../middleware/passwordValidator");
const { sanitizeUser } = require("../utils/userPayload");
const { clearSessionCookies } = require("../utils/sessionCookies");
const { generateEmailVerificationToken, hashToken } = require("../utils/tokenUtils");
const { sendEmailVerificationEmail } = require("../utils/mailer");
const logger = require("../utils/logger");

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await UserModel.getUserById(userId);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
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

    const current = (await UserModel.getUserById(userId)).rows[0];
    if (!current) return res.status(404).json({ error: "User not found" });
    if (current.supabase_user_id && email !== undefined && email.toLowerCase() !== current.email.toLowerCase()) {
      return res.status(409).json({ error: "Confirm this email change with your identity provider first." });
    }
    let verificationToken;
    if (!current.supabase_user_id && email !== undefined &&
        (email.toLowerCase() !== current.email.toLowerCase() || !current.email_verified)) {
      verificationToken = generateEmailVerificationToken();
      updates.email_verified = false;
      updates.email_verification_token = hashToken(verificationToken);
    }
    const result = await UserModel.updateUser(userId, updates);
    if (!result.rows.length) return res.status(404).json({ error: "User not found" });
    let verificationSent;
    if (verificationToken) {
      try {
        await sendEmailVerificationEmail(result.rows[0].email, verificationToken);
        verificationSent = true;
      } catch (error) {
        verificationSent = false;
        logger.error("Profile verification email failed", { message: error.message });
      }
    }
    res.json({ ...sanitizeUser(result.rows[0]), verification_sent: verificationSent });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(err.status || 500).json({ error: err.message });
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
    const passwordErrors = validatePassword(new_password);
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

    if (user.supabase_user_id) return res.status(400).json({ error: "Change your password with your identity provider." });
    const passwordValid = await bcrypt.compare(current_password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 12);

    // Update password
    const changed = await query(
      `UPDATE users 
       SET password = $1, refresh_token = NULL, session_version = session_version + 1,
           password_reset_token = NULL, password_reset_expires = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND password = $3 RETURNING id`,
      [hashedPassword, userId, user.password]
    );

    if (!changed.rows.length) return res.status(409).json({ error: "Password has changed. Please sign in again." });
    clearSessionCookies(res);
    res.json({ message: "Password changed successfully. Please sign in again." });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Get addresses
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.getUserAddresses(userId);
    res.json(addresses);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Create address
exports.createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const address = await Address.createAddress({ ...req.body, user_id: userId });
    res.status(201).json(address);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
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
    res.status(err.status || 500).json({ error: err.message });
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
    res.status(err.status || 500).json({ error: err.message });
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
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Get payment methods
exports.getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentMethods = await PaymentMethod.getUserPaymentMethods(userId);
    res.json(paymentMethods);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
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
    res.status(err.status || 500).json({ error: err.message });
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
    res.status(err.status || 500).json({ error: err.message });
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
    res.status(err.status || 500).json({ error: err.message });
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
    res.status(err.status || 500).json({ error: err.message });
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
    res.status(err.status || 500).json({ error: err.message });
  }
};

// MFA setup
exports.initiateMfaSetup = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await UserModel.getUserById(userId);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.mfa_enabled) {
      return res.status(409).json({ error: "Disable your existing MFA with a valid code before setting it up again." });
    }

    const secret = authenticator.generateSecret();
    await query(
      `UPDATE users SET mfa_secret = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND mfa_enabled = false`,
      [secret, userId]
    );

    const otpauthUrl = authenticator.keyuri(user.email, "Mechora", secret);

    res.json({
      secret,
      otpauth_url: otpauthUrl,
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.enableMfa = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    const result = await UserModel.getUserById(userId);
    const user = result.rows[0];

    if (!user || !user.mfa_secret) {
      return res.status(400).json({ error: "MFA setup not initialized" });
    }

    const isValid = authenticator.check(code, user.mfa_secret);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid MFA code" });
    }

    const changed = await query(
      `UPDATE users SET mfa_enabled = true, refresh_token = NULL,
         session_version = session_version + 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND mfa_secret = $2 AND mfa_enabled = false RETURNING id`,
      [userId, user.mfa_secret]
    );

    if (!changed.rows.length) return res.status(409).json({ error: "MFA setup has changed. Please try again." });
    clearSessionCookies(res);
    res.json({ message: "MFA enabled. Please sign in again." });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.disableMfa = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    const result = await UserModel.getUserById(userId);
    const user = result.rows[0];

    if (!user || !user.mfa_secret) {
      return res.status(400).json({ error: "MFA not enabled" });
    }

    const isValid = authenticator.check(code, user.mfa_secret);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid MFA code" });
    }

    const changed = await query(
      `UPDATE users 
         SET mfa_enabled = false, mfa_secret = NULL, refresh_token = NULL,
           session_version = session_version + 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND mfa_secret = $2 AND mfa_enabled = true RETURNING id`,
      [userId, user.mfa_secret]
    );

    if (!changed.rows.length) return res.status(409).json({ error: "MFA has changed. Please try again." });
    clearSessionCookies(res);
    res.json({ message: "MFA disabled. Please sign in again." });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
