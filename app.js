const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const morgan = require("morgan")
const cors = require("cors")
const mongoose = require("mongoose")

// Load all Routes Here
const ExpenseTrackerUsers = require("./ExpenseTracker/Server/User/User")
const ExpenseTrackerIncomes = require("./ExpenseTracker/Server/Incomes/Incomes")
const ExpenseTrackerExpenses = require("./ExpenseTracker/Server/Expenses/Expenses")
const ExpenseTrackerExpensesCategory = require("./ExpenseTracker/Server/ExpenseCategory/ExpenseCategory")
const ExpenseTrackerExpensesReport = require("./ExpenseTracker/Server/Report/Report")

// Database Connection with MongoDB
mongoose.connect('mongodb+srv://sahilmallick:sahilmallick9635@sahilmallick.yawwcxk.mongodb.net/?retryWrites=true&w=majority')
// Checking Mondo DB connection
mongoose.connection.on('error', err => {
    console.log("Connection Failed..Please Try Again");
})
mongoose.connection.on('connected', connected => {
    console.log("Connection Successfully..You can Use this MongoDb Now");
})
const corsOptions = {
    origin: '*',
    methods: 'GET, POST, PUT, DELETE',
};
app.use(cors(corsOptions));
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// End Points
app.use("/User", ExpenseTrackerUsers)
app.use("/Expense", ExpenseTrackerExpenses)
app.use("/Income", ExpenseTrackerIncomes)
app.use("/Category", ExpenseTrackerExpensesCategory)
app.use("/Report", ExpenseTrackerExpensesReport)

app.use((req, res, next) => {
    res.status(200).json({
        message: "Welcome to the Personal Expense Tracker Application",
    })
})


module.exports = app