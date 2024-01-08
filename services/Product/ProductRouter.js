import express from "express";
import Product from "../../models/Product/Product.js";
import { getProductById } from "./ProductService.js";
import { verifyPermission } from '../../middleware/verifyPermission.js';

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ 
            message: 'Lấy tất cả sản phẩm thành công', 
            data: products
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// Lấy sản phẩm theo ID
router.get('/:id', async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        res.status(200).json({ 
            message: 'Lấy sản phẩm thành công',
            data: product 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// Thêm sản phẩm
router.post('/create', verifyPermission, async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(200).json({
            message: 'Thêm sản phẩm thành công',
            product: savedProduct
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Sửa sản phẩm theo id
router.put('/edit/:id', verifyPermission, async (req, res) => {
    const id = req.params.id;

    try {
        await Product.findOneAndUpdate({ _id: id }, { ...req.body });
        res.status(200).json({
            message: 'Sửa sản phẩm thành công'
         });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Xóa sản phẩm
router.delete('/delete/:id', verifyPermission, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Xóa sản phẩm thành công' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router