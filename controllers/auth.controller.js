const User = require("../models/User");
const bcrypt = require("bcryptjs");

const authController = {};
const jwt = require("jsonwebtoken");

require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

authController.loginWithEmail = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = await user.generateToken();
                return res.status(200).json({ status: "success", user, token });
            }
        }
        throw new Error("이메일 또는 비밀번호를 다시 확인해주세요.");
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

// 미들웨어이므로 next 추가
authController.authenticate = async (req, res, next) => {
    try {
        const tokenString = req.headers.authorization;
        if (!tokenString) {
            throw new Error("token not found");
        }
        const token = tokenString.replace("Bearer ", "");
        jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
            if (error) throw new Error("invalid token");
            req.userId = payload._id; // 다음 함수에 보내줄 user 값 셋팅
        });
        next();
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

authController.checkAdminPermission = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await User.findById(userId);
        if (user.level !== "admin") {
            throw new Error("no permission");
        }
        next();
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = authController;
