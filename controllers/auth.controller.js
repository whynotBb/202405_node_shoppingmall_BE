const User = require("../models/User");
const bcrypt = require("bcryptjs");

const authController = {};
// const jwt = require("jsonwebtoken");

// require("dotenv").config();
// const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

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

module.exports = authController;
