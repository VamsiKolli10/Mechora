const express = require("express");
const router = express.Router();
const paymentsController = require("../controllers/paymentsController");
const { optionalAuth } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { paymentSchemas } = require("../validation/schemas");

router.post(
  "/intent",
  optionalAuth,
  validateRequest(paymentSchemas.createIntent),
  paymentsController.createPaymentIntent
);

module.exports = router;
