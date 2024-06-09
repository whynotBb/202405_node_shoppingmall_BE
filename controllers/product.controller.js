const Product = require("../models/Product");
const { options } = require("../routes/product.api");
const PAGE_SIZE = 5;
const productController = {};
productController.createProduct = async (req, res) => {
    try {
        const {
            sku,
            name,
            size,
            image,
            category,
            description,
            price,
            stock,
            status,
        } = req.body;
        const product = new Product({
            sku,
            name,
            size,
            image,
            category,
            description,
            price,
            stock,
            status,
        });
        await product.save();
        res.status(200).json({ status: "success", product });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};
productController.getProducts = async (req, res) => {
    try {
        const { page, name } = req.query;
        // 정확히 일치해야 함
        // const products = await Product.find({ name });
        // 정규식 options -i => 대소문자 구분 없이
        const cond = name
            ? { name: { $regex: name, $options: "i" }, isDelete: false }
            : { isDelete: false };
        let query = Product.find(cond).sort({ _id: -1 });
        let response = { status: "success" };
        //mongoose 함수
        //skip() - page 2 면 1그룹을 skip
        //limit() - 보내주고 싶은데이터 최대 몇개? 설정
        if (page) {
            query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
            //total page : 데이터 총 갯수 / page_size
            const totalItemNum = await Product.find(cond).count();
            const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
            response.totalPageNum = totalPageNum;
        }

        const productList = await query.exec();
        response.data = productList;
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};
productController.getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

productController.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const {
            sku,
            name,
            image,
            size,
            price,
            description,
            category,
            stock,
            status,
        } = req.body;
        const product = await Product.findByIdAndUpdate(
            { _id: productId },
            {
                sku,
                name,
                image,
                size,
                price,
                description,
                category,
                stock,
                status,
            },
            { new: true }
        );
        console.log(product);
        if (!product) throw new Error("상품이 존재하지 않습니다.");
        res.status(200).json({ status: "success", data: product });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

productController.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findByIdAndUpdate(
            { _id: productId },
            { isDelete: true }
        );
        console.log(product);
        if (!product) throw new Error("상품이 존재하지 않습니다.");
        product.isDelete = true; // product 의 isdelete true 로 바꾸기

        // Save the updated product
        await product.save();
        res.status(200).json({ status: "success", data: product });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = productController;
