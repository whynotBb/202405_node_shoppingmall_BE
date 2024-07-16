const { populate } = require("dotenv");
const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");
const PAGE_SIZE = 5;

const orderController = {};

orderController.createOrder = async (req, res) => {
	try {
		// fe에서 보낸거 받아오기 {}
		const { userId } = req;
		const { totalPrice, shipTo, contact, items } = req.body;
		console.log("be!!!", req.body);
		// 재고 확인하고, 재고 업데이트 한다. : 재고가 체크 되는 productController 에 함수를 만들어 처리
		const insufficientStockItems = await productController.checkItemListStock(items);
		// 재고가 불충분한 아이템이 있으면 > error
		// insufficientStockItems배열에서 item 의 message 만 뽑아서(reduce), 스트링""으로 반환
		if (insufficientStockItems.length > 0) {
			const errorMessage = insufficientStockItems.reduce((total, item) => (total += item.message), "");
			throw new Error(errorMessage);
		}
		// order 만들기
		const newOrder = new Order({
			userId,
			totalPrice,
			shipTo,
			contact,
			items: items,
			orderNum: randomStringGenerator(),
		});
		await newOrder.save();
		console.log(newOrder);
		res.status(200).json({
			status: "success",
			data: newOrder,
			orderNum: newOrder.orderNum,
		});
	} catch (error) {
		return res.status(400).json({ status: "fail", error: error.message });
	}
};

orderController.getOrderList = async (req, res) => {
	try {
		const { userId } = req;
		console.log(userId);
		// 데이터 중에 userId 가 일치하는 전체를 가져오기 .find({ userId: userId });
		const orderList = await Order.find({ userId: userId }).populate({
			path: "items",
			populate: {
				path: "productId",
				model: "Product",
			},
		});
		if (!orderList) throw new Error("주문 리스트가 없습니다.");
		console.log(orderList);
		res.status(200).json({ status: "success", data: orderList });
	} catch (error) {
		return res.status(400).json({ status: "fail", error: error.message });
	}
};

orderController.getOrders = async (req, res) => {
	try {
		const { page, orderNum } = req.query;
		const cond = orderNum && {
			orderNum: { $regex: orderNum, $options: "i" },
		};

		let query = Order.find(cond)
			.sort({ _id: -1 })
			.populate({
				path: "userId",
				model: "User",
				select: "email",
			})
			.populate({
				path: "items",
				populate: {
					path: "productId",
					model: "Product",
				},
			});
		let response = { status: "success" };
		if (page) {
			query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
			const totalItemNum = await Order.find(cond).count();
			const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
			response.totalPageNum = totalPageNum;
		}

		const orderList = await query.exec();
		response.data = orderList;
		res.status(200).json(response);
	} catch (error) {
		return res.status(400).json({ status: "fail", error: error.message });
	}
};

orderController.updateOrder = async (req, res) => {
	try {
		console.log("updateOrder In");
		const { userId } = req;
		const orderId = req.params.id;
		const { status } = req.body;

		console.log("updateOrder!!!", req.body);
		const order = await Order.findByIdAndUpdate(
			{ _id: orderId },
			{ status },
			{ new: true } // 업데이트 된 데이터를 반환하도록 설정
		);

		res.status(200).json({
			status: "success",
			data: order,
		});
	} catch (error) {
		return res.status(400).json({ status: "fail", error: error.message });
	}
};

module.exports = orderController;
