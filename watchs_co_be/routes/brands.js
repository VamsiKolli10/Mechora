const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const { requireAuth } = require("../middleware/authMiddleware");

// Public routes
router.get("/", brandController.getAllBrands);
router.get("/:id", brandController.getBrandById);
router.get("/slug/:slug", brandController.getBrandBySlug);

// Protected routes (admin only - add admin check later)
router.post("/", requireAuth, brandController.createBrand);
router.put("/:id", requireAuth, brandController.updateBrand);
router.delete("/:id", requireAuth, brandController.deleteBrand);

module.exports = router;

