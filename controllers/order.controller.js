const Order = require("../models/Order");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../utils/randomStringGenerator");

const orderController = {};

orderController.createOrder = async (req, res) => {
    try {
        // fe에서 보낸거 받아오기 {}
        const { userId } = req;
        const { totalPrice, shipTo, contact, orderList } = req.body;
        // 재고 확인하고, 재고 업데이트 한다. : 재고가 체크 되는 productController 에 함수를 만들어 처리
        const insufficientStockItmes =
            await productController.checkItemListStock(orderList);
        // 재고가 불충분한 아이템이 있으면 > error
        // insufficientStockItmes배열에서 item 의 message 만 뽑아서(reduce), 스트링""으로 반환
        if (insufficientStockItmes.length > 0) {
            const errorMessage = insufficientStockItmes.reduce(
                (total, item) => (total += item.message),
                ""
            );
            throw new Error(errorMessage);
        }
        // order 만들기
        const newOrder = new Order({
            userId,
            totalPrice,
            shipTo,
            contact,
            items: orderList,
            orderNum: randomStringGenerator(),
        });
        await newOrder.save();
        res.status(200).json({
            status: "success",
            orderNum: newOrder.orderNum,
        });
    } catch (error) {
        {
            return res
                .status(400)
                .json({ status: "fail", error: error.message });
        }
    }
};

module.exports = orderController;
