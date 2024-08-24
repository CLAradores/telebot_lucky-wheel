const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const ValidCodesModel = require("./models/ValidCodes");
const allCodes = require("./codes");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(
    express.json({
        strict: true, // This will reject payloads with invalid JSON
    })
);

// Middleware to catch invalid JSON errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).send({ error: "Invalid JSON format" });
    }
    next();
});

const dbURI = process.env.DB_URI;

mongoose
    .connect(dbURI) // Removed deprecated options
    .then(() => {
        console.log("MongoDB Connected for seeding");
        return ValidCodesModel.deleteMany({}); // Clear existing data
    })
    .then(() => {
        return ValidCodesModel.insertMany(allCodes); // Insert new data
    })
    .then(() => {
        console.log("Data seeded successfully");
        console.log("MongoDB Connected");
        mongoose.connection.close();
    })
    .catch((err) => {
        console.error("Seeding error:", err);
        mongoose.connection.close();
    });

// GET endpoint to fetch all codes
app.get("/getCodes", async (req, res) => {
    try {
        const codes = await ValidCodesModel.find({});
        res.json(codes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH endpoint to update code status to 'used'
app.patch("/updateStatus/:code", async (req, res) => {
    const { code } = req.params;

    try {
        const updatedCode = await ValidCodesModel.findOneAndUpdate(
            { code: code, status: "active" },
            { status: "used" },
            { new: true }
        );

        if (updatedCode) {
            res.json({
                success: true,
                message: "Code status updated to 'used'",
                updatedCode,
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Code not found or already used",
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH endpoint to update any code's status
app.patch("/update/:code", async (req, res) => {
    const { code } = req.params;
    try {
        const updatedCode = await ValidCodesModel.findOneAndUpdate(
            { code: code },
            { status: req.body.status },
            { new: true }
        );
        if (updatedCode) {
            res.status(200).json(updatedCode);
        } else {
            res.status(404).json({ error: "Code not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update status" });
    }
});

// POST endpoint to add a new code
app.post("/addCode", async (req, res) => {
    const { code, status } = req.body;

    if (!code || !status) {
        return res.status(400).json({ error: "Code and status are required" });
    }

    try {
        const newCode = new ValidCodesModel({ code, status });
        await newCode.save();
        res.status(201).json({
            success: true,
            message: "Code added successfully",
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to add code" });
    }
});

// DELETE endpoint to remove a code
app.delete("/deleteCode/:code", async (req, res) => {
    const { code } = req.params;

    try {
        const result = await ValidCodesModel.deleteOne({ code: code });

        if (result.deletedCount > 0) {
            res.status(200).json({
                success: true,
                message: "Code deleted successfully",
            });
        } else {
            res.status(404).json({ success: false, message: "Code not found" });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete code",
        });
    }
});

app.listen(3001, () => {
    console.log("Server is Running");
});
