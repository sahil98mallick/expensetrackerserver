const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const ExpenseTrackerUsers = require("../../model/User/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const ImageKit = require("imagekit");


// Image Cloud Server Setup

const imagekit = new ImageKit({
    publicKey: "public_Si93pSkoQAbQ3cMRRj5aAW+Lgwk=",
    privateKey: "private_PXIsikXskmXAd6MaBU+f2BqsnwA=",
    urlEndpoint: "https://ik.imagekit.io/cqxtcg0kv"
});

// Define the storage engine for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Register New user
router.post('/Register', upload.single('Image'), (req, res, next) => {

    if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
    }
    // Upload the image to ImageKit
    const folderName = "ExpenseTrackerUsers";
    imagekit.upload(
        {
            file: req.file.buffer,
            fileName: req.file.originalname,
            folder: folderName
        },
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    error: err
                });
            }

            // Check if the email already exists in the database
            ExpenseTrackerUsers.findOne({ email: req.body.email })
                .exec()
                .then(existingUser => {
                    if (existingUser) {
                        return res.status(409).json({
                            status: 409,
                            message: "Email already exists"
                        });
                    } else {
                        bcrypt.hash(req.body.password, 10, (err, hash) => {
                            if (err) {
                                return res.status(500).json({
                                    status: 500,
                                    details: err.message,
                                    error: err
                                });
                            } else {
                                const useralldata = new ExpenseTrackerUsers({
                                    _id: new mongoose.Types.ObjectId(),
                                    name: req.body.name,
                                    email: req.body.email,
                                    password: hash,
                                    phone: req.body.phone,
                                    userType: req.body.userType,
                                    activestatus: req.body.activestatus,
                                    Image: result.url
                                });

                                useralldata.save()
                                    .then(result => {
                                        res.status(200).json({
                                            success: true,
                                            status: 200,
                                            message: "Registration Completed",
                                            usersdata: result
                                        });
                                    })
                                    .catch(err => {
                                        res.status(500).json({
                                            status: 500,
                                            message: "Registration Not Completed",
                                            error: err
                                        });
                                    });
                            }
                        });
                    }
                })
                .catch(err => {
                    res.status(500).json({
                        status: 500,
                        message: "Registration Process Failed",
                        error: err
                    });
                });
        }
    );
});

// Delete the Users by Id
router.delete('/delete/:id', (req, res) => {
    ExpenseTrackerUsers.deleteOne({ _id: req.params.id })
        .then(result => {
            if (result.deletedCount > 0) {
                // console.log(result);
                res.status(200).json({
                    success: true,
                    message: "Deleted successfully",
                    deleteuserdata: result
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "No data found",
                    deleteuserdata: []
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                message: "Failed to delete User data",
                error: err
            });
        });
});

// Implement Login Facility
router.post('/Login', ((req, res, next) => {
    ExpenseTrackerUsers.find({ email: req.body.email })
        .exec()
        .then(users => {
            if (users.length < 1) {
                return res.status(200).json({
                    message: "User Not present"
                });
            }
            bcrypt.compare(req.body.password, users[0].password, (err, result) => {
                if (!result) {
                    return res.status(200).json({
                        message: "Password not Matched..Please try Again"
                    })
                }
                if (result) {
                    const token = jwt.sign({
                        _id: users[0]._id,
                        name: users[0].name,
                        email: users[0].email,
                        password: users[0].password,
                        phone: users[0].phone,
                        userType: users[0].userType,
                        activestatus: users[0].activestatus,
                        Image: users[0].Image
                    },
                        'logintoken',
                        {
                            expiresIn: "24h"
                        });
                    res.status(200).json({
                        status: 200,
                        success: true,
                        message: "Login Successfully",
                        user: {
                            _id: users[0]._id,
                            name: users[0].name,
                            email: users[0].email,
                            password: users[0].password,
                            phone: users[0].phone,
                            userType: users[0].userType,
                            activestatus: users[0].activestatus,
                            Image: users[0].Image
                        },
                        token: token
                    })
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                message: "Login Failed..Please Try After Some Times",
                error: err
            })
        })
}))

// Implement Single user Details
router.get('/singleuser/:id', ((req, res, next) => {
    ExpenseTrackerUsers.findById(req.params.id)
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

// Update Users Details, including Image Update
router.put('/updateuser/:id', upload.single('Image'), (req, res, next) => {
    // Handle the uploaded image here
    const file = req.file;
    if (file) {
        // Upload the new image to ImageKit
        const folderName = "ExpenseTrackerUsers";
        imagekit.upload(
            {
                file: file.buffer,
                fileName: file.originalname,
                folder: folderName
            },
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: 500,
                        error: err
                    });
                }
                // Update the user data with the new image URL
                req.body.Image = result.url;
                updateUserData();
            }
        );
    } else {
        updateUserData();
    }

    function updateUserData() {
        const updateUserData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            userType: req.body.userType,
            activestatus: req.body.activestatus,
            Image: req.body.Image
        };

        // If a new password is provided, hash and update it
        if (req.body.password) {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        status: 500,
                        error: err
                    });
                }
                updateUserData.password = hash;
                updateUser();
            });
        } else {
            updateUser();
        }

        function updateUser() {
            // Update the user details, including the image
            ExpenseTrackerUsers.findByIdAndUpdate(req.params.id, updateUserData, { new: true })
                .then(updatedUser => {
                    if (!updatedUser) {
                        return res.status(404).json({
                            status: false,
                            message: "User not found"
                        });
                    }
                    res.status(200).json({
                        status: 200,
                        success: true,
                        message: "User Updated Successfully",
                        updateduser: updatedUser
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err,
                        status: false,
                        message: "Failed to update User details."
                    });
                });
        }
    }
});

// Update User's Image
router.put('/profileimage/:id', upload.single('Image'), (req, res, next) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: "No image file provided" });
    }

    // Upload the new image to ImageKit
    const folderName = "ExpenseTrackerUsers";
    imagekit.upload(
        {
            file: file.buffer,
            fileName: file.originalname,
            folder: folderName
        },
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    error: err
                });
            }

            // Update the user's image URL in the database
            ExpenseTrackerUsers.findByIdAndUpdate(
                req.params.id,
                { Image: result.url },
                { new: true }
            )
                .then(updatedUser => {
                    if (!updatedUser) {
                        return res.status(404).json({
                            status: false,
                            message: "User not found"
                        });
                    }

                    res.status(200).json({
                        status: 200,
                        success: true,
                        message: "Profile image Updated",
                        updateduser: updatedUser
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err,
                        status: false,
                        message: "Failed to update user's image"
                    });
                });
        }
    );
});

// Change Password From Account
router.put('/changepasswordfromaccount', (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    // Find the user by email
    ExpenseTrackerUsers.findOne({ email: email })
        .exec()
        .then(user => {
            if (!user) {
                return res.status(200).json({
                    status: false,
                    message: "User not found"
                });
            }

            // Compare the current password with the stored hashed password
            bcrypt.compare(currentPassword, user.password, (err, result) => {
                if (!result) {
                    return res.status(200).json({
                        status: false,
                        message: "Current password is incorrect"
                    });
                }

                // Hash the new password
                bcrypt.hash(newPassword, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            status: false,
                            error: err,
                            message: "Failed to hash the new password"
                        });
                    }

                    // Update the user's password in the database
                    ExpenseTrackerUsers.findByIdAndUpdate(
                        user._id,
                        { password: hash },
                        { new: true }
                    )
                        .then(updatedUser => {
                            res.status(200).json({
                                status: true,
                                message: "Password changed successfully",
                                updateduser: updatedUser
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                status: false,
                                error: err,
                                message: "Failed to update password"
                            });
                        });
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                status: false,
                error: err,
                message: "Failed to find user by email"
            });
        });
});

// Reset Password
router.put('/resetpassword', (req, res) => {
    const { email, phone, newPassword } = req.body;
    if (!email || !phone || !newPassword) {
        return res.status(400).json({
            status: 400,
            message: "Please provide email, phone, and new password",
        });
    }

    // Find the user by email and phone
    ExpenseTrackerUsers.findOne({ email, phone })
        .exec()
        .then(user => {
            if (!user) {
                return res.status(200).json({
                    status: 200n,
                    message: "User not found",
                });
            }

            bcrypt.hash(newPassword, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        status: 500,
                        error: err,
                        message: "Failed to hash the new password",
                    });
                }

                ExpenseTrackerUsers.findByIdAndUpdate(
                    user._id,
                    { password: hash },
                    { new: true }
                )
                    .then(updatedUser => {
                        if (!updatedUser) {
                            return res.status(500).json({
                                status: 500,
                                message: "Failed to update the password",
                            });
                        }

                        res.status(200).json({
                            status: 200,
                            success: true,
                            message: "Password Changed Successfully",
                            updateduser: {
                                _id: updatedUser._id,
                                name: updatedUser.name,
                                email: updatedUser.email,
                                phone: updatedUser.phone,
                                userType: updatedUser.userType,
                                activestatus: updatedUser.activestatus,
                                Image: updatedUser.Image,
                            },
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            status: 500,
                            error: err,
                            message: "Failed to update the password",
                        });
                    });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                status: 500,
                error: err,
                message: "Failed to find the user",
            });
        });
});

// View All users
router.get('/allusers', ((req, res, next) => {
    ExpenseTrackerUsers.find()
        .then(result => {
            if (result && result.length > 0) {
                // console.log(result);
                res.status(200).json({
                    success: true,
                    totalcount: result.length,
                    message: "All Users data retrieved successfully",
                    usersData: result
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "No data found",
                    usersData: []
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                message: "Users data Not retrieved Properly",
                error: err
            })
        })
}))

// Update Users Active Status Details
router.put('/updateuseractivestatus/:id', (req, res) => {
    const updateactiveData = {
        activestatus: req.body.activestatus,
    };

    ExpenseTrackerUsers.findByIdAndUpdate(req.params.id, updateactiveData, { new: true })
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).json({
                    status: false,
                    message: "User is not Active or No Changes Found",
                });
            }
            res.status(200).json({
                status: true,
                message: "Status Updated Successfully",
                updatedactiveuser: updatedUser
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err,
                status: false,
                message: "Failed to Update",
            });
        });
});
module.exports = router