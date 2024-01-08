import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
    UserID:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    Token: {
        type: String,
        required: true
    }
})

const Token = mongoose.model('Token', TokenSchema); 

export default Token
