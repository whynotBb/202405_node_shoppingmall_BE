const express = require("express");
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller");
const router = express.Router();

router.post("/", authController.authenticate, orderController.createOrder);
router.get("/", authController.authenticate, orderController.getOrderList);
router.put("/:id", authController.authenticate, orderController.updateOrder);
router.get("/all", authController.authenticate, authController.checkAdminPermission, orderController.getOrders);

module.exports = router;
