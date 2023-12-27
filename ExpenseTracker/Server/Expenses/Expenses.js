const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const ExpensesUserDetails = require("../../model/Expenses/Expenses");

// Add Expense Details
router.post('/AddExpenses', (req, res, next) => {
    const Expensedata = new ExpensesUserDetails({
        _id: new mongoose.Types.ObjectId(),
        userID: req.body.userID,
        categoryID: req.body.categoryID,
        expensedate: req.body.expensedate,
        expenseamounts: req.body.expenseamounts,
        expenseremark: req.body.expenseremark,
        createdAt: new Date(),
    });

    Expensedata.save()
        .then(result => {
            res.status(200).json({
                success: true,
                status: 200,
                message: "Expense Added Successfully",
                Expensedata: result
            });
        })
        .catch(err => {
            res.status(500).json({
                status: 500,
                message: "Expense details not added",
                error: err
            });
        });
});

// View Jobs by UserID
router.get('/expensedetails/:userID', (req, res, next) => {
    const { userID } = req.params;

    ExpensesUserDetails.find({ userID })
        .then(result => {
            if (result && result.length > 0) {
                res.status(200).json({
                    success: true,
                    totalcount: result.length,
                    message: `Expenses details retrieved successfully for userID: ${userID}`,
                    ExpenseData: result
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: `No Expense details found for userID: ${userID}`,
                    ExpenseData: []
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                message: `Failed to retrieve Expense details for userID: ${userID}`,
                error: err
            });
        });
});

// Delete the jobs by Id
router.delete('/deleteexpenses/:id', (req, res) => {
    ExpensesUserDetails.deleteOne({ _id: req.params.id })
        .then(result => {
            if (result.deletedCount > 0) {
                // console.log(result);
                res.status(200).json({
                    success: true,
                    message: "Deleted successfully",
                    deletedata: result
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "No data found",
                    deletedata: []
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                message: "Failed to delete data",
                error: err
            });
        });
});

// Update Expense Details
router.put('/updateexpense/:id', (req, res, next) => {
    const expenseID = req.params.id;
    const updateData = {
        userID: req.body.userID,
        categoryID: req.body.categoryID,
        expensedate: req.body.expensedate,
        expenseamounts: req.body.expenseamounts,
        expenseremark: req.body.expenseremark,
        createdAt: new Date(),
    };

    ExpensesUserDetails.findByIdAndUpdate(expenseID, updateData, { new: true })
        .then(updatedexpense => {
            if (updatedexpense) {
                res.status(200).json({
                    success: true,
                    status: 200,
                    message: "Expense details updated successfully",
                    updatedexpense: updatedexpense
                });
            } else {
                res.status(404).json({
                    success: false,
                    status: 404,
                    message: "Expense details not found for update",
                    updatedexpense: null
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                status: 500,
                message: "Failed to update Expense details",
                error: err
            });
        });
});

// View current month's total expenses by category
router.get('/currentMonthExpenses/:userID', (req, res, next) => {
    const { userID } = req.params;
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    ExpensesUserDetails.aggregate([
        {
            $match: {
                userID: userID,
                expensedate: {
                    $gte: firstDayOfMonth,
                    $lte: lastDayOfMonth
                }
            }
        },
        {
            $group: {
                _id: {
                    categoryID: "$categoryID",
                    month: { $month: "$expensedate" }
                },
                totalExpense: { $sum: { $toDouble: "$expenseamounts" } }
            }
        },
        {
            $project: {
                _id: 0,
                categoryID: "$_id.categoryID",
                month: "$_id.month",
                totalExpense: 1
            }
        }
    ])
        .then(result => {
            if (result && result.length > 0) {
                const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);

                res.status(200).json({
                    success: true,
                    message: `Current month's (${monthName}) total expenses by category retrieved successfully for userID: ${userID}`,
                    CurrentMonthExpenseData: result
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: `No expense details found for the current month and userID: ${userID}`,
                    CurrentMonthExpenseData: []
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                message: `Failed to retrieve current month's expenses by category for userID: ${userID}`,
                error: err
            });
        });
});


module.exports = router