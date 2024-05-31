const express = require('express');
const userController = require('../controllers/user.controller');
const router = express.Router();
//회원가입
router.post('/', userController.createUser);
// 회원 조회 - api test 용
router.get('/', userController.getUser);

module.exports = router;
