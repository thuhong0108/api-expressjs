import express from "express";
import Order from "../../models/Sale/Order.js";
import OrderHistory from "../../models/Sale/OrderHistory.js";
import OrderItem from "../../models/Sale/OrderItem.js";
import Payment from "../../models/Sale/Payment.js";
import { getProductById } from "../Product/ProductService.js";
import { verifyToken } from "../../middleware/verifyPermission.js";

const router = express.Router();

/* 
    Các chức năng của Quản Lí Bán Hàng:
    - Đặt hàng
    - Thanh toán đơn hàng
    - Xem tất cả đơn hàng
    - Xem chi tiết đơn hàng theo id
    - Xem chi tiết các đơn hàng của người dùng nào đó theo userId
    - Xem lịch sử đặt hàng
    - Xoá đơn hàng
*/


// Xem tất cả các đơn hàng
router.get('/viewOrders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json({ 
            message: 'Lấy tất cả đơn hàng thành công', 
            data: orders
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// Xem chi tiết đơn hàng theo orderId
router.get('/viewOrders/:orderId', async (req, res) => {
    const OrderID = req.params.orderId;

    try {
        const order = await Order.findById(OrderID);

        // Lấy các sản phẩm trong đơn hàng từ bảng OrderItem
        const orderItems = await OrderItem.find({ OrderID });

        const orderDetail = { ...order._doc, orderItems };

        res.status(200).json({
            message: 'Lấy chi tiết đơn hàng thành công',
            data: orderDetail
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Xem chi tiết các đơn hàng của người dùng nào đó theo userId
router.get('/viewOrdersUser/:userId', async (req, res) => {
    const UserID = req.params.userId;

    try {
        // Lấy tất cả các đơn hàng của người dùng từ bảng Order
        const orders = await Order.find({ UserID });
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng nào của người dùng này' });
        }

        // Lấy thông tin chi tiết cho mỗi đơn hàng
        const ordersDetails = [];

        for (const order of orders) {
            const OrderID = order._id;

            // Lấy các sản phẩm trong đơn hàng từ bảng OrderItem
            const orderItems = await OrderItem.find({ OrderID });

            const orderDetail = { ...order._doc, orderItems };
            ordersDetails.push(orderDetail);
        }

        res.status(200).json({
            message: 'Lấy chi tiết các đơn hàng của người dùng thành công',
            orders: ordersDetails
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Xem lịch sử đặt hàng
router.get('/orderHistory', async (req, res) => {
    try {
        const orders = await OrderHistory.find();

        res.status(200).json({
            message: 'Lấy lịch sử đặt hàng thành công',
            data: orders
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Đặt hàng
router.post('/order/:userId', verifyToken, async (req, res) => {
    const userId = req.params.userId;
    const products = req.body.products; // Một mảng danh sách các sản phẩm được đặt hàng

    try {
        // Lấy danh sách sản phẩm cần đặt và tính tổng giá trị đơn hàng
        const orderItems = [];
        let totalAmount = 0;

        for (const product of products) {
            const productInfo = await getProductById(product.productId);
            
            if (!productInfo) {
                return res.status(404).json({ message: `Không tìm thấy sản phẩm có id = ${product.productId}` });
            }

            const itemTotal = productInfo.Price * product.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                productId: product.productId,
                quantity: product.quantity,
                price: productInfo.Price,
            });
        }

        // Tạo đơn hàng
        const order = new Order({
            UserID: userId,
            TotalAmount: totalAmount,
        });

        // Lưu đơn hàng vào database
        const savedOrder = await order.save();

        // Thêm đơn hàng vừa đặt vào lịch sử đặt hàng
        const orderHistory = new OrderHistory({ OrderID: savedOrder._id });
        await orderHistory.save();

        // Thêm thông tin của các sản phẩm trong đơn hàng vừa đặt vào bảng OrderItem
        const orderItemsToSave = orderItems.map(item => ({
            OrderID: savedOrder._id,
            ProductID: item.productId,
            Quantity: item.quantity,
            Price: item.price,
        }));

        await OrderItem.insertMany(orderItemsToSave);

        res.status(200).json({
            message: 'Đặt hàng thành công',
            order: savedOrder
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Thanh toán đơn hàng
router.post('/payment/:orderId', async (req, res) => {
    const orderId = req.params.orderId;
    const paymentMethod = req.body.paymentMethod; // 'Online' hoặc 'On Delivery'

    try {
        // Kiểm tra đơn hàng cần thanh toán có tồn tại hay không
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        }
        
        // Kiểm tra phương thức thanh toán có hợp lệ hay không
        if (paymentMethod !== 'Online'&& paymentMethod !== 'On Delivery') {
            return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ' });
        }

        // Tạo thanh toán
        const payment = new Payment({
            OrderID: orderId,
            PaymentMethod: paymentMethod,
            Amount: order.TotalAmount,
        });

       // Cập nhật trạng thái đơn hàng
       if (paymentMethod === 'Online') {
            order.Status = 'Processing';
        } else if (paymentMethod === 'On Delivery') {
            order.Status = 'Delivered';
        }

        // Lưu thanh toán và cập nhật đơn hàng vào database
        await payment.save();
        await order.save();

        // Cập nhật trường UpdatedAt của đơn hàng đó trong lịch sử đặt hàng
        const orderHistory = await OrderHistory.findOne({ OrderID: order._id });
        orderHistory.UpdatedAt = new Date();
        await orderHistory.save();

        res.status(200).json({ message: 'Thanh toán thành công' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Xoá đơn hàng theo orderId
router.delete('/deleteOrder/:orderId', async (req, res) => {
    const orderId = req.params.orderId;

    try {
        // Kiểm tra xem đơn hàng có tồn tại hay không
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        }

         // Kiểm tra xem đơn hàng có ở trạng thái "Pending" hay không
        if (order.Status !== 'Pending') {
            return res.status(400).json({ message: 'Chỉ có thể xoá đơn hàng khi ở trạng thái Pending' });
        }

        // Xoá đơn hàng, các sản phẩm trong đơn hàng và thanh toán của đơn hàng
        await Order.findByIdAndDelete(orderId);
        await OrderItem.deleteMany({ OrderID: orderId });
        await Payment.deleteMany({ OrderID: orderId });

        // Xoá đơn hàng khỏi lịch sử đặt hàng
        await OrderHistory.findOneAndDelete({ OrderID: orderId });

        res.status(200).json({ message: 'Xoá đơn hàng thành công' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router