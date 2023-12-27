const mongoose = require('mongoose')

const ExpenseTrackerUserSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    password: String,
    phone: Number,
    userType: String,
    activestatus: Boolean,
    Image: String
})


module.exports = mongoose.model('ExpenseTrackerUser', ExpenseTrackerUserSchema)