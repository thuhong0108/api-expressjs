import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv'
import userRouter from './services/User/UserRouter.js';
import authRouter from './services/AuthRouter.js';
import productRouter from './services/Product/ProductRouter.js';
import saleRouter from './services/Sale/SaleRouter.js';

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, () => {
    console.log('Connected to MongoDB');
});


// Routers
app.use('/auth-service', authRouter);

app.use('/user-service', userRouter);

app.use('/product-service', productRouter);

app.use('/sale-service', saleRouter);


// Start server
app.listen(8000, () => {
    console.log('User Service API started on PORT 8000');
});

