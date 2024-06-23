const { response } = require("express");
const Cart = require("../models/Cart");
const { populate } = require("dotenv");
const { model } = require("mongoose");

const cartController = {};

cartController.addItemToCart = async (req, res) => {
    try {
        const { userId } = req;
        const { productId, size, qty } = req.body;
        // 유저를 가지고 카트 찾기
        let cart = await Cart.findOne({ userId });
        // 유저의 카트 없으면(신규회원) 만들어주기
        if (!cart) {
            cart = new Cart({ userId });
            await cart.save();
        }
        // 카트에 이미 있는 아이템인가?(productId 와 size 모두 체크)
        // 몽구스 오브젝트 아이디 타입은 스트링이 아니므로 equals 함수로 일치여부를 확인한다.
        const exsitItem = cart.items.find(
            (item) => item.productId.equals(productId) && item.size === size
        );
        // > 에러('카트에 이미 아이템이 있습니다.')
        if (exsitItem) throw new Error("아이템이 이미 카트에 담겨있습니다.");
        // 카트에 아이템 추가
        cart.items = [...cart.items, { productId, size, qty }];
        await cart.save();
        res.status(200).json({
            status: "success",
            data: cart,
            cartItmeQty: cart.items.length, // 카트에 있는 아이템의ㄱ ㅐ수
        });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};
cartController.getItemToCart = async (req, res) => {
    try {
        const { userId } = req;
        // 유저를 가지고 카트 찾기
        // 카트에는 현재 userId, items : productId, size, qty 정보밖에 없기 때문에
        // populate를 활용하여 productId(외래키)에 있는 데이터 가져오기
        // path : 기준 / model : 가져고올 정보를 가지고 있는 모델
        const cart = await Cart.findOne({ userId }).populate({
            path: "items",
            populate: {
                path: "productId",
                model: "Product",
            },
        });
        console.log("cart", userId, cart);
        // 카트가 없으면
        if (!cart) {
            throw new Error("카트가 비어있습니다.");
        }
        res.status(200).json({
            status: "success",
            data: cart,
        });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};
cartController.deleteItem = async (req, res) => {
    try {
        const { userId } = req;
        const productId = req.params.id;
        const cart = await Cart.findOne({ userId });
        cart.items = cart.items.filter((item) => !item._id.equals(productId));
        await cart.save();
        res.status(200).json({ status: 200, cartItmeQty: cart.items.length });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};
cartController.updateItem = async (req, res) => {
    try {
        const { userId } = req;
        const id = req.params.id;
        const { qty } = req.body;
        const cart = await Cart.findOne({ userId }).populate({
            path: "items",
            populate: {
                path: "productId",
                model: "Product",
            },
        });
        if (!cart) throw new Error("There is no cart for this user");
        console.log(cart);
        const index = cart.items.findIndex((item) => item._id.equals(id));
        if (index === -1) throw new Error("Can not find item");
        cart.items[index].qty = qty;
        await cart.save();
        res.status(200).json({ status: 200, cartItmeQty: cart.items.length });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

cartController.getCartQty = async (req, res) => {
    try {
        const { userId } = req;
        const cart = await Cart.findOne({ userId });
        if (!cart) throw new Error("There is no cart!");
        res.status(200).json({ status: 200, cartItmeQty: cart.items.length });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = cartController;
