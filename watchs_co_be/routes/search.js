const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");
const { validateRequest } = require("../middleware/validateRequest");
const { searchSchemas } = require("../validation/schemas");

// Public routes
router.get("/", validateRequest(searchSchemas.search), searchController.search);
router.get(
  "/suggestions",
  validateRequest(searchSchemas.suggestions),
  searchController.getSuggestions
);

module.exports = router;
