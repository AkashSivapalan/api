const mongoose = require('mongoose');
const { Schema, model } = mongoose;


const UserSchema = new Schema({
    email: { type: String, required: true,unique:true },
    password: { type: String, required: true },
    name: { type: String, required: true },
},
    { collection: 'user-data' }
);

const UserModel = model('User', UserSchema);

module.exports = UserModel;
