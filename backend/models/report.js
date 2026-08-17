const mongoose = require("mongoose");

const labResultSchema = new mongoose.Schema(
    {
        testName: {
            type: String,
            required: true,
            trim: true
        },

        value: {
            type: String,
            required: true
        },

        unit: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["normal", "attention", "high", "low", "unknown"],
            default: "unknown"
        }
    },
    {
        _id: false
    }
);


const reportSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        reportName: {
            type: String,
            required: true,
            trim: true
        },

        reportDate: {
            type: Date,
            default: Date.now
        },

        results: {
            type: [labResultSchema],
            default: []
        },

        analysisSummary: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model("Report", reportSchema);