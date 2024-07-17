const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const indexRouter = require("./routes/index");
const app = express();

require("dotenv").config();
const MONGODB_URI_PROD = process.env.MONGODB_URI_PROD;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // req.body 가 객체로 인식되도록

app.use("/api", indexRouter);
// 정적 파일 제공을 위한 설정
app.use(express.static(path.join(__dirname, "build")));

// 모든 비 API 요청을 index.html로 리디렉션
app.get("/*", function (req, res) {
	res.sendFile(path.join(__dirname, "build", "index.html"));
});

// const mongoURI = process.env.LOCAL_DB_ADDRESS;
const mongoURI = MONGODB_URI_PROD;

mongoose
	.connect(mongoURI, {
		useNewUrlParser: true,
	})
	.then(() => console.log("mongoose connected"))
	.catch((err) => console.log("connection fail", err));

app.listen(process.env.PORT || 5000, () => {
	console.log("server on");
});
