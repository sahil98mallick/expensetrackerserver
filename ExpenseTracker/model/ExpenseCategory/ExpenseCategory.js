const mongoose = require('mongoose')

const ExpensesCategorySchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: String,
    categoryname: String,
    createdAt: String,
})


module.exports = mongoose.model('ExpensesCategorySchema', ExpensesCategorySchema)