const mongoose = require('mongoose')

const IncomesSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: String,
    incomesource: String,
    incomeamounts: String,
    createdAt: String,
})


module.exports = mongoose.model('IncomesSchema', IncomesSchema)