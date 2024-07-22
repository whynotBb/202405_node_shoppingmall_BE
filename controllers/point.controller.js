const Point = require("../models/Point");
const pointController = {};

pointController.addPoint = async (req, res) => {
	try {
		const { userId } = req;
		const { pointInfo } = req.body;
		console.log("addPoint!!!", userId, req.body);
		const newPointInfo = new Point({
			userId,
			addPoint: pointInfo,
		});
		await newPointInfo.save();
		console.log(newPointInfo);
		res.status(200).json({ status: "success", data: newPointInfo });
	} catch (error) {
		return res.status(400).json({ status: "fail", error: error.message });
	}
};

module.exports = pointController;
