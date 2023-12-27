const mongoose = require('mongoose')

const ExpenseReportSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: String,
    expenseDetails: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ExpensesSchema',
        }
    ],
    monthstartdate: String,
    monthenddate: String,
    totalamounts: String,
    createdAt: String,
})


module.exports = mongoose.model('ExpenseReportSchema', ExpenseReportSchema)