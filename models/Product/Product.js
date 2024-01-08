import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Category: {
        type: String,
        required: true
    },
    Price: {
        type: String,
        required: true
    }
})

const Product = mongoose.model('Product', productSchema); 

export default Product