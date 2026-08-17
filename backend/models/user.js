const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
        
        },

        age: {
            type: Number
        },

        gender: {
            type: String
        },

        height: {
            type: Number
        },

        weight: {
            type: Number
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);