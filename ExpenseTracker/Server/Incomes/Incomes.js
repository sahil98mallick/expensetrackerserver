const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const IncomesUserDetails = require("../../model/Incomes/Incomes");


// Add Income Details
router.post('/AddIncomes', (req, res, next) => {
    const Incomedata = new IncomesUserDetails({
        _id: new mongoose.Types.ObjectId(),
        userID: req.body.userID,
        incomesource: req.body.incomesource,
        incomeamounts: req.body.incomeamounts,
        createdAt: new Date(),
    });

    Incomedata.save()
        .then(result => {
            res.status(200).json({
                success: true,
                status: 200,
                message: "Income Added Successfully",
                Incomedata: result
            });
        })
        .catch(err => {
            res.status(500).json({
                status: 500,
                message: "Income details not added",
                error: err
            });
        });
});

// View Jobs by UserID
router.get('/incomedetails/:userID', (req, res, next) => {
    const { userID } = req.params;

    IncomesUserDetails.find({ userID })
        .then(result => {
            if (result && result.length > 0) {
                res.status(200).json({
                    success: true,
                    totalcount: result.length,
                    message: `Income details retrieved successfully for userID: ${userID}`,
                    IncomeData: result
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: `No Income details found for userID: ${userID}`,
                    IncomeData: []
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                message: `Failed to retrieve Income details for userID: ${userID}`,
                error: err
            });
        });
});

// Delete the jobs by Id
router.delete('/deleteincome/:id', (req, res) => {
    IncomesUserDetails.deleteOne({ _id: req.params.id })
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

// Update Income Details
router.put('/updateincomes/:id', (req, res, next) => {
    const IncomeID = req.params.id;
    const updateData = {
        userID: req.body.userID,
        incomesource: req.body.incomesource,
        incomeamounts: req.body.incomeamounts,
        createdAt: new Date(),
    };

    IncomesUserDetails.findByIdAndUpdate(IncomeID, updateData, { new: true })
        .then(updatedIncomes => {
            if (updatedIncomes) {
                res.status(200).json({
                    success: true,
                    status: 200,
                    message: "Income details updated successfully",
                    updatedIncomes: updatedIncomes
                });
            } else {
                res.status(404).json({
                    success: false,
                    status: 404,
                    message: "Income details not found for update",
                    updatedIncomes: null
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                status: 500,
                message: "Failed to update Income details",
                error: err
            });
        });
});





module.exports = router