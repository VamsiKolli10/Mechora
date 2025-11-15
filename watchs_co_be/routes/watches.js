const express = require("express");
const router = express.Router();
const watchesController = require("../controllers/watchesController");

router.post("/", watchesController.createWatch);
router.get("/", watchesController.getAllWatches);
router.get("/search/:query", watchesController.searchWatches);
router.get("/:id", watchesController.getWatchById);
router.put("/:id", watchesController.updateWatch);
router.delete("/:id", watchesController.deleteWatch);

module.exports = router;
