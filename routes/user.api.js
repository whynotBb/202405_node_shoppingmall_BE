const express = require("express");
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();
//회원가입
router.post("/", userController.createUser);
// 토큰 로그인 - get 으로 쓴다, header 에 token 을 넣어서 받기 때문
// 1. 토큰이 유효한지 확인 valid : authController.authenticate (미들웨어)
// 2. 토큰값을 가지고 user 찾아서 return : userController.getUser
router.get("/me", authController.authenticate, userController.getUser);

module.exports = router;
