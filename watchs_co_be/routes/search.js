const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");

// Public routes
router.get("/", searchController.search);
router.get("/suggestions", searchController.getSuggestions);

module.exports = router;

