const express = require("express");
const router = express.Router();
const statsController = require("../controller/stats.js");

router.get("/", statsController.summary);

module.exports = router;
