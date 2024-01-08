import express from "express";
import jwt from 'jsonwebtoken';
import User from '../models/User/User.js';
import Token from '../models/User/Token.js';

const router = express.Router();

// Đăng nhập
router.post('/login', async (req, res) => {
    const { Username, Password } = req.body;

    try {
        const user = await User.findOne({ Username });

        // nếu tìm thấy user trong database
        if (user && Password === user.Password) {
            // tạo token
            const data = { UserId: user._id, IsAdmin: user.IsAdmin };
            const token = jwt.sign(data, process.env.TOKEN_KEY);

            // tìm trong bảng Token, user vừa đăng nhập đã có token hay chưa
            const tokenRecord  = await Token.findOne({ UserID: user._id });

            // nếu có => cập nhập lại token đó cho user vừa đăng nhập
            if (tokenRecord) {
                tokenRecord.Token = token;
                await tokenRecord.save();
                res.status(200).json({ 
                    message: 'Đăng nhập thành công',
                    token: tokenRecord
                });

             // nếu không => tạo token mới cho user vừa đăng nhập
            } else {
                const newToken = new Token({ UserID: user._id, Token: token });
                await newToken.save();
                res.status(200).json({ 
                    message: 'Đăng nhập thành công',
                    token: newToken
                });
            }

        } else {
            res.status(401).json({ message: 'Username hoặc password không chính xác' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
});

// Đăng kí người dùng
router.post('/register', async (req, res) => {
    const { Username, Email } = req.body;

    try {
        const username = await User.findOne({ Username });
        const email = await User.findOne({ Email });

         // Kiểm tra username và email của user mới thêm có tồn tại hay chưa
        if (!username && !email) {
            const newUser = new User(req.body);
            const savedUser = await newUser.save();
           
            res.status(200).json({ 
                message: 'Đăng kí thành công',
                data: savedUser
            });
        } else {
            res.status(404).json({ message: 'Username hoặc email đã tồn tại' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
});

// Lấy tất cả token
router.get('/token/getAll', async (req, res) => {
    try {
        const tokens = await Token.find();
        res.status(200).json({ 
            message: 'Lấy tất cả token thành công', 
            data: tokens
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Đăng xuất
router.post('/logout', async (req, res) => {
    const token = req.body.token;
    try {
        const deletedToken = await Token.findOneAndDelete({ Token: token });
        if (deletedToken) {
            res.status(200).json({ message: 'Đăng xuất thành công' });
        } else {
            res.status(404).json({ message: 'Đăng xuất không thành công' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
});

export default router