const express = require("express");
const pointController = require("../controllers/point.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post("/", authController.authenticate, pointController.addPoint);

module.exports = router;
