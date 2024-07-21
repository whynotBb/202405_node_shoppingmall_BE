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
        const { page, name, category } = req.query;
        console.log("category", category);
        // 정확히 일치해야 함
        // const products = await Product.find({ name });
        // 정규식 options -i => 대소문자 구분 없이
        // const cond = name
        //     ? { name: { $regex: name, $options: "i" }, isDelete: false }
        //     : { isDelete: false };
        let cond = { isDelete: false };

        // Add name condition if provided
        if (name) {
            cond.name = { $regex: name, $options: "i" };
        }

        // Add category condition if provided
        if (category) {
            if (category === "all") {
            } else {
                // Assuming category is a comma-separated string in query params
                const categoryArray = category
                    .split(",")
                    .map((cat) => cat.trim());
                cond.category = { $in: categoryArray };
            }
        }
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

productController.checkStock = async (item) => {
    console.log("checkStock!!!!", item);
    // 구매하려는 아이템 재고정보 가져오기
    const product = await Product.findById(item.productId);
    console.log("checkStock product!!!!", product);
    // 구매 qty 와 재고
    if (product.stock[item.size] < item.qty) {
        return {
            isVerify: false,
            message: `${product.name}의 ${item.size} 재고가 부족합니다.`,
        };
    }
    // 재고가 불충분하면, 메시지와 함께 데이터 반환
    // 충분하면 재고에서 구매 qty 를 빼고 성공 결과 보내기
    const newStock = { ...product.stock };
    // newStock[(item.size -= item.qty)];
    console.log("eeeee", newStock[item.size]);
    newStock[item.size] -= item.qty;
    console.log("checkStock newStock!!!!", newStock);
    product.stock = newStock;

    await product.save();
    return { isVerify: true };
};

productController.checkItemListStock = async (itemList) => {
    console.log("checkItemListStock", itemList);
    const insufficientStockItems = [];
    // 재고 확인 로직
    // 비동기 로직이 많은 경우 Promise.all 을 사용하여 좀 더 빠르게 처리할 수 있다. 직렬->병렬로 처리됨
    // console.log("map 돌리는 곳", itemList, insufficientStockItems);
    await Promise.all(
        itemList.map(async (item) => {
            const stockCheck = await productController.checkStock(item);
            if (!stockCheck.isVerify) {
                insufficientStockItems.push({
                    item,
                    message: stockCheck.message,
                });
            }
            return stockCheck;
        })
    );
    return insufficientStockItems;
};

module.exports = productController;
