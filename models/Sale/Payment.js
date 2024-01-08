import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    OrderID: {
        type: mongoose.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    PaymentDate: {
        type: Date,
        default: Date.now
    },
    PaymentMethod: {
        type: String,
        required: true
    },
    Amount: {
        type: Number,
        required: true
    }
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment
