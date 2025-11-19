const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { brandSchemas } = require("../validation/schemas");

// Public routes
router.get("/", brandController.getAllBrands);
router.get("/:id", brandController.getBrandById);
router.get("/slug/:slug", brandController.getBrandBySlug);

// Protected routes (admin only - add admin check later)
router.post(
  "/",
  requireAuth,
  requireAdmin,
  validateRequest(brandSchemas.create),
  brandController.createBrand
);
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validateRequest(brandSchemas.update),
  brandController.updateBrand
);
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validateRequest(brandSchemas.update),
  brandController.deleteBrand
);

module.exports = router;
