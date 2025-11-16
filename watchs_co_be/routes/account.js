const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const { requireAuth } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(requireAuth);

// Profile routes
router.get("/profile", accountController.getProfile);
router.put("/profile", accountController.updateProfile);
router.put("/password", accountController.changePassword);

// Address routes
router.get("/addresses", accountController.getAddresses);
router.post("/addresses", accountController.createAddress);
router.put("/addresses/:addressId", accountController.updateAddress);
router.delete("/addresses/:addressId", accountController.deleteAddress);
router.put("/addresses/:addressId/default", accountController.setDefaultAddress);

// Payment method routes
router.get("/payment-methods", accountController.getPaymentMethods);
router.post("/payment-methods", accountController.createPaymentMethod);
router.delete("/payment-methods/:paymentMethodId", accountController.deletePaymentMethod);
router.put("/payment-methods/:paymentMethodId/default", accountController.setDefaultPaymentMethod);

// Order history routes
router.get("/orders", accountController.getOrderHistory);
router.get("/orders/:orderId", accountController.getOrderDetails);

module.exports = router;

