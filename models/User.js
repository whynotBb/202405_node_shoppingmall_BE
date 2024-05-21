const mongoose = require('mongoose');
const Schema = mongoose.Schema;
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
            default: 'customer', //2type - customer , admin
        },
    },
    {timestamps: true}
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

const User = mongoose.model('User', userSchema);
module.exports = User;
