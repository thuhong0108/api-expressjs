import jwt from 'jsonwebtoken';
import Token from '../models/User/Token.js';

/* 
    - Sau khi đăng nhập, server sẽ trả về 1 token
    - Khi thực hiện 1 request, ta cần phải gửi token đó lên trong phần Headers, có key là Authorization
    - Sau đó middleware `verifyPermission` sẽ kiểm tra xem token gửi lên có hợp lệ hay không
*/

export const verifyPermission = async (req, res, next) => {
    // lấy token trong phần `Headers`
    const token = req.header('Authorization');
    // nếu không tìm thấy token gửi lên
    if (!token) {
        return res.status(401).json({ message: "Không tìm thấy token" });
    }

    // tìm token trong database
    const tokenDatabase = await Token.findOne({ Token: token });
    if (!tokenDatabase) {
        return res.status(403).json({ message: 'Token không hợp lệ' });
    }

    try {
        // jwt.verify: giải mã token để lấy dữ liệu
        const data = jwt.verify(token, process.env.TOKEN_KEY);

        // kiểm tra người dùng có phải là admin hay không
        if (data.IsAdmin) {
            next();
        } else {
            res.status(403).json({ message: 'Bạn không phải phải là admin' });
        }

    } catch (error) {
        res.status(403).json({ message: error.message });
    }
}


export const verifyToken = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: "Không tìm thấy token" });
    }

    const tokenDatabase = await Token.findOne({ Token: token });
    if (!tokenDatabase) {
        return res.status(403).json({ message: 'Token không hợp lệ' });
    }

    next();
}