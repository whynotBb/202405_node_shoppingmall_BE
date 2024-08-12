const Point = require("../models/Point");
const pointController = {};

pointController.addPoint = async (req, res) => {
    try {
        const { userId } = req;
        const { points } = req.body;
        console.log("addPoint!!!", userId, points);
        const newPointEntry = {
            date: new Date(),
            points,
        };
        let userPoints = await Point.findOne({ userId });
        if (!userPoints) {
            userPoints = new Point({
                userId,
                totalPoint: points,
                addPoints: [newPointEntry],
                deductPoints: [],
            });
        } else {
            userPoints.totalPoint += points;
            userPoints.addPoints.push(newPointEntry);
        }
        await userPoints.save();
        res.status(200).json({ status: "success", data: userPoints });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};
pointController.deductPoint = async (req, res) => {
    try {
        const { userId } = req;
        const { points } = req.body;
        console.log("deductPoint!!!", userId, points);
        const newPointEntry = {
            date: new Date(),
            points,
        };
        let userPoints = await Point.findOne({ userId });
        if (userPoints.totalPoint <= 0) {
        } else {
            userPoints.totalPoint -= points;
            userPoints.deductPoints.push(newPointEntry);
        }
        await userPoints.save();
        res.status(200).json({ status: "success", data: userPoints });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

pointController.getPoint = async (req, res) => {
    try {
        const { userId } = req;
        const userPoints = await Point.findOne({ userId });
        if (!userPoints) throw new Error("적립된 포인트가 없습니다.");
        res.status(200).json({ status: "success", data: userPoints });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = pointController;
