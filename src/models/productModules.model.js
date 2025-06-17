const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    sectionName: {
        type: String,
        required: true
    }
}, { _id: false });

const pathSchema = new mongoose.Schema({
    pathName: {
        type: String,
        required: true
    },
    section: [sectionSchema]
}, { _id: false });

const moduleSchema = new mongoose.Schema({
    path: [pathSchema]
}, { _id: false });

const prodModuleSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true
    },
    modules: [moduleSchema]
});

module.exports = mongoose.model("ProductModel", prodModuleSchema);