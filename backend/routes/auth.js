const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const router = express.Router();


// ========================================
// SIGN UP
// ========================================

router.post("/signup", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });

        }


        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });

        }


        const existingUser =
            await User.findOne({
                email: email.toLowerCase().trim()
            });


        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });

        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        const user = new User({

            name: name.trim(),

            email:
                email.toLowerCase().trim(),

            password:
                hashedPassword

        });


        await user.save();


        res.status(201).json({

            success: true,

            message:
                "BioQuest account created successfully",

            user: {

                id: user._id,

                name: user.name,

                email: user.email

            }

        });


    } catch (error) {

        console.error(
            "Signup error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Server error during signup"

        });

    }

});


// ========================================
// LOGIN
// ========================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"

            });

        }


        const user =
            await User.findOne({
                email: email.toLowerCase().trim()
            });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password || ""
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        res.json({

            success: true,

            message:
                "Login successful",

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                age: user.age,

                gender: user.gender,

                height: user.height,

                weight: user.weight

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Server error during login"

        });

    }

});


module.exports = router;