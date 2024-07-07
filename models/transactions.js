// import { model,Schema } from "mongoose";
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
// const model = mongoose.model;


const TransactionSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    datetime: { type: Date, required: true },
    email:{type:String, required: true}
},
    { collection: 'transaction-data' }
);

const TransactionModel = model('Transaction', TransactionSchema);

module.exports = TransactionModel;
