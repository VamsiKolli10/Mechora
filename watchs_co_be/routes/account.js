const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const { requireAuth } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { accountSchemas, orderSchemas } = require("../validation/schemas");

// All routes require authentication
router.use(requireAuth);

// Profile routes
router.get("/profile", accountController.getProfile);
router.put(
  "/profile",
  validateRequest(accountSchemas.updateProfile),
  accountController.updateProfile
);
router.put(
  "/password",
  validateRequest(accountSchemas.changePassword),
  accountController.changePassword
);

// Address routes
router.get("/addresses", accountController.getAddresses);
router.post(
  "/addresses",
  validateRequest(accountSchemas.createAddress),
  accountController.createAddress
);
router.put(
  "/addresses/:addressId",
  validateRequest(accountSchemas.updateAddress),
  accountController.updateAddress
);
router.delete(
  "/addresses/:addressId",
  validateRequest(accountSchemas.setDefaultAddress),
  accountController.deleteAddress
);
router.put(
  "/addresses/:addressId/default",
  validateRequest(accountSchemas.setDefaultAddress),
  accountController.setDefaultAddress
);

// Payment method routes
router.get("/payment-methods", accountController.getPaymentMethods);
router.post(
  "/payment-methods",
  validateRequest(accountSchemas.paymentMethod),
  accountController.createPaymentMethod
);
router.delete(
  "/payment-methods/:paymentMethodId",
  validateRequest(accountSchemas.deletePayment),
  accountController.deletePaymentMethod
);
router.put(
  "/payment-methods/:paymentMethodId/default",
  validateRequest(accountSchemas.setDefaultPayment),
  accountController.setDefaultPaymentMethod
);

// Order history routes
router.get("/orders", accountController.getOrderHistory);
router.get(
  "/orders/:orderId",
  validateRequest(orderSchemas.getOrder),
  accountController.getOrderDetails
);

router.post(
  "/mfa/setup",
  validateRequest(accountSchemas.mfaSetup),
  accountController.initiateMfaSetup
);
router.post(
  "/mfa/enable",
  validateRequest(accountSchemas.mfaEnable),
  accountController.enableMfa
);
router.post(
  "/mfa/disable",
  validateRequest(accountSchemas.mfaDisable),
  accountController.disableMfa
);

module.exports = router;
