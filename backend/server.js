const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Routes
const userRoutes = require("./routes/users");
const reportRoutes = require("./routes/reports");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;


// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());


// ========================================
// API ROUTES
// ========================================

app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);


// ========================================
// MONGODB CONNECTION
// ========================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        console.log(
            "MongoDB connected successfully ✅"
        );

    })
    .catch((error) => {

        console.error(
            "MongoDB connection failed ❌"
        );

        console.error(
            error.message
        );

    });


// ========================================
// TEST ROUTE
// ========================================

app.get("/", (req, res) => {

    res.json({

        message:
            "BioQuest backend is running 🚀",

        database:
            mongoose.connection.readyState === 1
                ? "connected"
                : "not connected"

    });

});


// ========================================
// START SERVER
// ========================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `BioQuest backend running on port ${PORT}`
    );
});