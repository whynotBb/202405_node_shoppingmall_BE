const express = require("express");
const authController = require("../controllers/auth.controller");
const productController = require("../controllers/product.controller");
const router = express.Router();

// admin 인지 확인 후 product 생성
router.post(
    "/",
    authController.authenticate,
    authController.checkAdminPermission,
    productController.createProduct
);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

router.put(
    "/:id",
    authController.authenticate,
    authController.checkAdminPermission,
    productController.updateProduct
);
router.delete(
    "/:id",
    authController.authenticate,
    authController.checkAdminPermission,
    productController.deleteProduct
);

module.exports = router;
