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
            type: String
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
        },

        // ==========================================
        // BIOQUEST HEALTH PASSPORT
        // ==========================================

        healthPassport: {

            bloodGroup: {
                type: String,
                default: ""
            },

            allergies: {
                type: String,
                default: ""
            },

            medications: {
                type: String,
                default: ""
            },

            emergencyContactName: {
                type: String,
                default: ""
            },

            emergencyContactPhone: {
                type: String,
                default: ""
            },

            emergencyNotes: {
                type: String,
                default: ""
            },

            // Information the user allows
            // emergency viewers to see

            shareBloodGroup: {
                type: Boolean,
                default: false
            },

            shareAllergies: {
                type: Boolean,
                default: false
            },

            shareMedications: {
                type: Boolean,
                default: false
            },

            shareEmergencyContact: {
                type: Boolean,
                default: false
            }
        },

        // ==========================================
        // EMERGENCY QR
        // ==========================================

        emergencyToken: {
            type: String,
            unique: true,
            sparse: true
        },

        emergencyEnabled: {
            type: Boolean,
            default: false
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);