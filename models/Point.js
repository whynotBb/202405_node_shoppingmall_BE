const mongoose = require("mongoose");
const User = require("./User");
const Schema = mongoose.Schema;
const pointSchema = Schema({
	userId: {
		type: mongoose.ObjectId,
		ref: User,
	},
	totalPoint: {
		type: Number,
		require: true,
	},
	addPoint: { type: Object, required: true },
	deductPoint: { type: Object, required: true },
});

const Point = mongoose.model("Point", pointSchema);
module.exports = Point;
