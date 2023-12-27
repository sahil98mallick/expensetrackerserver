const mongoose = require('mongoose')

const ExpensesSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: String,
    categoryID: String,
    expensedate: Date,
    expenseamounts: String,
    expenseremark: String,
    createdAt: String,
})


module.exports = mongoose.model('ExpensesSchema', ExpensesSchema)