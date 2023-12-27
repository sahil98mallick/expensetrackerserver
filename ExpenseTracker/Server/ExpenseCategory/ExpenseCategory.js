const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const ExpensesCategoryDetails = require("../../model/ExpenseCategory/ExpenseCategory");

// Add Expense Details
router.post('/Addexpensecategory', (req, res, next) => {
    const Expensecatdata = new ExpensesCategoryDetails({
        _id: new mongoose.Types.ObjectId(),
        userID: req.body.userID,
        categoryname: req.body.categoryname,
        createdAt: new Date(),
    });

    Expensecatdata.save()
        .then(result => {
            res.status(200).json({
                success: true,
                status: 200,
                message: "Category Added Successfully",
                Expensecategorydata: result
            });
        })
        .catch(err => {
            res.status(500).json({
                status: 500,
                message: "Category details not added",
                error: err
            });
        });
});

// View Expense Category by UserID
router.get('/expensedetails/:userID', (req, res, next) => {
    const { userID } = req.params;

    ExpensesCategoryDetails.find({ userID })
        .then(result => {
            if (result && result.length > 0) {
                res.status(200).json({
                    success: true,
                    totalcount: result.length,
                    message: `ExpenseCategoryData details retrieved successfully for userID: ${userID}`,
                    ExpenseCategoryData: result
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: `No ExpenseCategoryData details found for userID: ${userID}`,
                    ExpenseCategoryData: []
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                message: `Failed to retrieve ExpenseCategoryData details for userID: ${userID}`,
                error: err
            });
        });
});

// Delete the jobs by Id
router.delete('/deletecategory/:id', (req, res) => {
    ExpensesCategoryDetails.deleteOne({ _id: req.params.id })
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

module.exports = router