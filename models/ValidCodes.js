const mongoose = require("mongoose");

const ValidCodesSchema = new mongoose.Schema({
    code: String,
    status: String,
});

const ValidCodesModel = mongoose.model("codes", ValidCodesSchema);
module.exports = ValidCodesModel;
