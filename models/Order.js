const mongoose = require('mongoose');
const User = require('./User');
const Product = require('./Product');
const Schema = mongoose.Schema;
const orderSchema = Schema(
    {
        shipTo: {
            type: Object,
            required: true,
        },
        contact: {
            type: Object,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        userId: {
            type: mongoose.ObjectId,
            ref: User,
        },
        status: {
            type: String,
            required: true,
            default: 'preparing',
        },
        orderNum: {type: String},
        items: [
            {
                productId: {
                    type: mongoose.ObjectId,
                    ref: Product,
                },
                qty: {
                    type: Number,
                    required: true,
                    default: 1,
                },
                size: {
                    type: String,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
            },
        ],
    },
    {timestamps: true}
);

// FE에 전달하지 않을 데이터 사전 제거
orderSchema.methods.toJSON = function () {
    const obj = this._doc;
    delete obj.__v;
    delete obj.updateAt;
    delete obj.createAt;
    return obj;
};

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
