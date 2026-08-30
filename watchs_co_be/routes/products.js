const express = require("express");
const router = express.Router();
const productsController = require("../controllers/productsController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { watchSchemas } = require("../validation/schemas");

// Public routes
router.get("/", validateRequest(watchSchemas.list), productsController.getAllProducts);
router.get("/featured", productsController.getFeaturedProducts);
router.get("/slug/:slug", productsController.getProductBySlug);
router.get("/search/:query", productsController.searchProducts);
router.get("/suggestions", productsController.getProductSuggestions);
router.get("/:id", productsController.getProductById);

// Protected routes (admin only)
router.post(
  "/",
  requireAuth,
  requireAdmin,
  validateRequest(watchSchemas.create),
  productsController.createProduct
);
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validateRequest(watchSchemas.update),
  productsController.updateProduct
);
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validateRequest(watchSchemas.delete),
  productsController.deleteProduct
);

module.exports = router;
