const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ExpensesUserDetails = require("../../model/User/User");
const ExpenseReport = require("../../model/Report/Report");
const Expenses = require("../../model/Expenses/Expenses");

// New route to generate monthly records of expenses
router.post('/generateMonthlyRecords', async (req, res) => {
    const { userID, monthstartdate, monthenddate } = req.body;

    try {
        // Check if the user exists
        const user = await ExpensesUserDetails.findById(userID);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if a report already exists for the specified date range
        const existingReport = await ExpenseReport.findOne({
            userID,
            monthstartdate,
            monthenddate,
        });

        // If a report already exists, return a response
        if (existingReport) {
            return res.status(200).json({
                success: true,
                status: 200,
                message: 'Report already generated for the specified date range',
                expenseReport: existingReport,
            });
        }

        // Find expenses within the specified month range
        const expenses = await Expenses.find({
            userID,
            expensedate: {
                $gte: new Date(monthstartdate),
                $lte: new Date(monthenddate),
            },
        });

        // Check if expenses exist
        if (expenses.length === 0) {
            return res.status(200).json({
                success: true,
                status: 200,
                message: 'No records found within the specified date range',
                expenseReport: null,
            });
        }

        // Calculate total amounts
        const totalamounts = expenses.reduce((total, expense) => total + parseFloat(expense.expenseamounts), 0).toString();

        // Create a new expense report
        const expenseReport = new ExpenseReport({
            _id: new mongoose.Types.ObjectId(),
            userID,
            expenseDetails: expenses.map(expense => expense._id),
            monthstartdate,
            monthenddate,
            totalamounts,
            createdAt: new Date().toString(),
        });

        // Save the expense report
        const savedReport = await expenseReport.save();

        res.status(200).json({
            success: true,
            status: 200,
            message: 'Monthly records generated successfully',
            expenseReport: savedReport,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: 'Failed to generate monthly records',
            error: error.message,
        });
    }
});


// Update route for monthly records of expenses by report ID
router.post('/updateexpenses/:reportsid', async (req, res) => {
    const { reportsid } = req.params;

    try {
        // Find the existing report by ID
        const existingReport = await ExpenseReport.findById(reportsid);

        // If the report doesn't exist, return an error
        if (!existingReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Find expenses within the specified month range
        const expenses = await Expenses.find({
            userID: existingReport.userID,
            expensedate: {
                $gte: new Date(existingReport.monthstartdate),
                $lte: new Date(existingReport.monthenddate),
            },
        });

        // Calculate total amounts
        const totalamounts = expenses.reduce((total, expense) => total + parseFloat(expense.expenseamounts), 0).toString();

        // Update existing report with the latest expenses details
        existingReport.expenseDetails = expenses.map(expense => expense._id);
        existingReport.totalamounts = totalamounts;
        existingReport.createdAt = new Date().toString();

        // Save the updated report
        const updatedReport = await existingReport.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: 'Report updated with latest expenses details',
            expenseReport: updatedReport,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: 'Failed to update monthly records',
            error: error.message,
        });
    }
});

// View Reports by UserID
router.get('/expensereports/:userID', (req, res, next) => {
    const { userID } = req.params;

    ExpenseReport.find({ userID })
        .then(result => {
            if (result && result.length > 0) {
                res.status(200).json({
                    success: true,
                    totalcount: result.length,
                    message: `Expenses details retrieved successfully for userID: ${userID}`,
                    ExpenseReportsData: result
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: `No Expense details found for userID: ${userID}`,
                    ExpenseReportsData: []
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

router.delete('/deleteexpensesreports/:id', (req, res) => {
    ExpenseReport.deleteOne({ _id: req.params.id })
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

// Implement Single user Details
router.get('/singleexpensereports/:id', ((req, res, next) => {
    ExpenseReport.findById(req.params.id)
        .then(result => {
            if (result) {
                res.status(200).json({
                    message: "Data Found Successfully",
                    status: true,
                    finddata: result
                })
            } else {
                res.status(500).json({
                    message: "No Data Found"
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: "Data Not Found",
                status: false,
                error: err
            })
        })
}))

module.exports = router;
