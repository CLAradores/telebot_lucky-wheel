const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const ValidCodesModel = require("./models/ValidCodes");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const dbURI = process.env.DB_URI;

mongoose
    .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.get("/getCodes", async (req, res) => {
    try {
        const codes = await ValidCodesModel.find({});
        res.json(codes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//UPDATE CODE STATUS
app.patch("/updateStatus/:code", async (req, res) => {
    const { code } = req.params;

    try {
        // Find the code by its code value and update the status to "used" only if it is "active"
        const updatedCode = await ValidCodesModel.findOneAndUpdate(
            { code: code, status: "active" }, // Ensure the code is "active"
            { status: "used" }, // Update status to "used"
            { new: true } // Return the updated document
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

//UPDATE CODE
app.patch("/update/:code", async (req, res) => {
    const { code } = req.params;
    try {
        const updatedCode = await ValidCodesModel.findOneAndUpdate(
            { code: code },
            { status: req.body.status }, // Update status to the value provided in the request
            { new: true } // Return the updated document
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

// New POST endpoint to add a new code
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

// New DELETE endpoint to remove a code
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
