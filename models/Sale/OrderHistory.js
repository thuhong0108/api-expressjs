import mongoose from "mongoose";

const orderHistorySchema = new mongoose.Schema({
    OrderID: {
        type: mongoose.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    UpdatedAt: { 
        type: Date,
        default: Date.now
    }
});

const OrderHistory = mongoose.model('OrderHistory', orderHistorySchema);

export default OrderHistory
