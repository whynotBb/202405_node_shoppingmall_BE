const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
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

authController.loginWithGoogle = async (req, res) => {
	try {
		const { token } = req.body;
		const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
		const ticket = await googleClient.verifyIdToken({
			idToken: token,
			audience: GOOGLE_CLIENT_ID,
		});
		const { email, name } = ticket.getPayload();
		console.log("loginWithGoogle", email, name);
		let user = await User.findOne({ email });
		if (!user) {
			// 유저생성
			// 유저 생성에 필요한 데이터 : 이메인, 이름, 비번 -> 여기서 구글 로그인 시 비번은 알 수 없으므로 랜덤한 값을 임의로 넣어서 채워주기
			const randomPassword = "" + Math.floor(Math.random() * 100000000);
			const salt = await bcrypt.genSalt(10);
			const newPassword = await bcrypt.hash(randomPassword, salt);
			user = new User({
				name,
				email,
				password: newPassword,
			});
			await user.save();
		}
		//토큰 발행 후 리턴
		const sessionToken = await user.generateToken();
		res.status(200).json({ status: "success", user, token: sessionToken });
	} catch (error) {
		res.status(400).json({ status: "fail", error: error.message });
	}
};

module.exports = authController;
