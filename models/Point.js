const mongoose = require("mongoose");
const User = require("./User");
const Schema = mongoose.Schema;

const pointEntrySchema = new Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    points: {
        type: Number,
        required: true,
    },
});

const pointSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true,
    },
    totalPoint: {
        type: Number,
        required: true,
        default: 0,
    },
    addPoints: [pointEntrySchema],
    deductPoints: [pointEntrySchema],
});

const Point = mongoose.model("Point", pointSchema);
module.exports = Point;
