import Product from "../../models/Product/Product.js";

// Hàm lấy sản phẩm theo ID
async function getProductById(productId) {
    try {
        const product = await Product.findById(productId);
        return product;
    } catch (error) {
        throw new Error(error.message);
    }
}

export { getProductById }