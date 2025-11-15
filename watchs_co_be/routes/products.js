const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("this is product route");
});

router.get("/101", (req, res) => {
  res.send("this is product 101 route");
});

router.get("/102", (req, res) => {
  res.send("this is product 102 route");
});

module.exports = router;
