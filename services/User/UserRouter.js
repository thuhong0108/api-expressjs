import express from "express";
import User from '../../models/User/User.js';
import { verifyPermission } from "../../middleware/verifyPermission.js";

const router = express.Router();

// Lấy tất cả người dùng
router.get('/', verifyPermission, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ 
            message: 'Lấy tất cả người dùng thành công', 
            data: users
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// Lấy người dùng theo id
router.get('/:id', verifyPermission, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json({ 
            message: 'Lấy người dùng thành công!', 
            data: user 
        });

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Sửa người dùng theo id
router.put('/edit/:id', verifyPermission, async (req, res) => {
    const id = req.params.id;
    const { Username, Email } = req.body;

    try {
        const existUserName = await User.findOne({ Username: Username });
        const existEmail = await User.findOne({ Email: Email });

        if (!existUserName && !existEmail) { 
            await User.findOneAndUpdate( { _id: id }, { ...req.body });
            res.status(200).json({ message: 'Sửa người dùng thành công' });
        } else {
            res.status(404).json({ message: 'Username hoặc email đã tồn tại' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Xóa người dùng
router.delete('/delete/:id', verifyPermission, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Xóa người dùng thành công' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router