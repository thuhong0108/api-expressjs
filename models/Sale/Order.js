import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    UserID: { 
      type: String,
      required: true
    },
    OrderDate: {
        type: Date,
        default: Date.now 
    },
    Status: { 
        type: String,
        enum: [ 'Pending', 'Processing', 'Delivered' ],
        default: 'Pending' 
    },
    TotalAmount: {
        type: Number, 
        default: 0 
    }
});

const Order = mongoose.model('Order', orderSchema);

export default Order
