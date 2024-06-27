const express = require("express");
const authController = require("../controllers/auth.controller");
const cartController = require("../controllers/cart.controller");
const router = express.Router();

router.post("/", authController.authenticate, cartController.addItemToCart);
router.get("/", authController.authenticate, cartController.getItemToCart);
router.put("/:id", authController.authenticate, cartController.updateItem);
router.get("/qty", authController.authenticate, cartController.getCartQty);
// 같은 method 를 사용한다면, 상세한거 먼저 작성한다. /all 인지 확인 후 /:id 확인하러감
router.delete(
    "/all",
    authController.authenticate,
    cartController.clearItemToCart
);
router.delete("/:id", authController.authenticate, cartController.deleteItem);

module.exports = router;
