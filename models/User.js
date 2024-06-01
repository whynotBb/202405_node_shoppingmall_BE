const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const userSchema = Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        level: {
            type: String,
            default: "customer", //2type - customer , admin
        },
    },
    { timestamps: true }
);

// FE에 전달하지 않을 데이터 사전 제거
userSchema.methods.toJSON = function () {
    const obj = this._doc;
    delete obj.password;
    delete obj.__v;
    delete obj.updateAt;
    delete obj.createAt;
    return obj;
};

userSchema.methods.generateToken = async function () {
    const token = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
        expiresIn: "1d", //1day 유효함
    });
    //expiresIn ->token 의 유효기간 설정
    return token;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
