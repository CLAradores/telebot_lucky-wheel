const mongoose = require("mongoose");
const ValidCodesModel = require("./models/ValidCodes");
const allCodes = require("./codes");
require("dotenv").config();
const dbURI = process.env.DB_URI;

mongoose
    .connect(dbURI)
    .then(() => {
        console.log("MongoDB Connected for seeding");
        return ValidCodesModel.deleteMany({}); // Clear existing data
    })
    .then(() => {
        return ValidCodesModel.insertMany(allCodes); // Insert new data
    })
    .then(() => {
        console.log("Data seeded successfully");
        mongoose.connection.close();
    })
    .catch((err) => {
        console.error("Seeding error:", err);
        mongoose.connection.close();
    });
