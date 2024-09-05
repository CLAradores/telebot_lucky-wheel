const mongoose = require("mongoose");

const ValidCodesSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    status: { type: String, required: true },
    winningSector: { type: Number, required: true },
});

const ValidCodesModel = mongoose.model("codes", ValidCodesSchema);
module.exports = ValidCodesModel;
