const express = require("express");
const Report = require("../models/report");

const router = express.Router();


// ================================
// CREATE REPORT
// ================================

router.post("/", async (req, res) => {

    try {

        const report = new Report(req.body);

        await report.save();

        res.status(201).json({
            success: true,
            message: "Report saved successfully",
            report
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

});


// ================================
// GET REPORTS FOR A USER
// ================================

router.get("/user/:userId", async (req, res) => {

    try {

        const reports = await Report.find({
            user: req.params.userId
        }).sort({
            createdAt: -1
        });

        res.json({
            success: true,
            reports
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});

// ================================
// DELETE REPORT
// ================================

router.delete("/:reportId", async (req, res) => {

    try {

        const report = await Report.findByIdAndDelete(
            req.params.reportId
        );

        if (!report) {

            return res.status(404).json({
                success: false,
                message: "Report not found"
            });

        }

        res.json({
            success: true,
            message: "Report deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});
module.exports = router;