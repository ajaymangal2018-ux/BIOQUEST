const express = require("express");
const User = require("../models/user");

const router = express.Router();


// =====================================================
// CREATE OR UPDATE USER / PROFILE
// =====================================================

router.post("/", async (req, res) => {

    try {

        const { email } = req.body;

        // Check whether this user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {

            // Update existing profile
            Object.assign(existingUser, req.body);

            await existingUser.save();

            return res.status(200).json({
                success: true,
                message: "BioQuest profile updated successfully",
                user: existingUser
            });

        }

        // Create new profile
        const user = new User(req.body);

        await user.save();

        res.status(201).json({
            success: true,
            message: "BioQuest profile created successfully",
            user
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

});


// =====================================================
// UPDATE USER / HEALTH PROFILE
// =====================================================

router.put("/:userId", async (req, res) => {

    try {

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            {
                name: req.body.name,
                age: req.body.age,
                gender: req.body.gender,
                height: req.body.height,
                weight: req.body.weight
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        res.json({
            success: true,
            message: "Health profile updated successfully",
            user
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

});


// =====================================================
// GET ALL USERS
// =====================================================

router.get("/", async (req, res) => {

    try {

        const users = await User.find();

        res.json({
            success: true,
            users
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});


// =====================================================
// GET SINGLE USER
// =====================================================

router.get("/:userId", async (req, res) => {

    try {

        const user =
            await User.findById(
                req.params.userId
            );

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        res.json({
            success: true,
            user
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

});


// =====================================================
// SAVE / UPDATE HEALTH PASSPORT
// =====================================================

router.put("/:userId/passport", async (req, res) => {

    try {

        const {
            bloodGroup,
            allergies,
            medications,
            emergencyContactName,
            emergencyContactPhone,
            emergencyNotes,
            shareBloodGroup,
            shareAllergies,
            shareMedications,
            shareEmergencyContact
        } = req.body;


        const user =
            await User.findByIdAndUpdate(
                req.params.userId,

                {
                    healthPassport: {

                        bloodGroup:
                            bloodGroup || "",

                        allergies:
                            allergies || "",

                        medications:
                            medications || "",

                        emergencyContactName:
                            emergencyContactName || "",

                        emergencyContactPhone:
                            emergencyContactPhone || "",

                        emergencyNotes:
                            emergencyNotes || "",

                        shareBloodGroup:
                            Boolean(
                                shareBloodGroup
                            ),

                        shareAllergies:
                            Boolean(
                                shareAllergies
                            ),

                        shareMedications:
                            Boolean(
                                shareMedications
                            ),

                        shareEmergencyContact:
                            Boolean(
                                shareEmergencyContact
                            )

                    }
                },

                {
                    new: true,
                    runValidators: true
                }
            );


        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        res.json({

            success: true,

            message:
                "Health Passport saved successfully",

            healthPassport:
                user.healthPassport

        });


    } catch (error) {

        console.error(
            "Health Passport save error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

});


// =====================================================
// GET HEALTH PASSPORT
// =====================================================

router.get("/:userId/passport", async (req, res) => {

    try {

        const user =
            await User.findById(
                req.params.userId
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        res.json({

            success: true,

            healthPassport:
                user.healthPassport || {}

        });


    } catch (error) {

        console.error(
            "Health Passport load error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

});


module.exports = router;