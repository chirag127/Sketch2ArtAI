const mongoose = require("mongoose");

const imageHistorySchema = new mongoose.Schema({
    originalImageUrl: {
        type: String,
        required: true,
    },
    convertedImageUrl: {
        type: String,
        required: true,
    },
    style: {
        type: String,
        default: "Anime",
    },
    prompt: {
        type: String,
        default: "",
    },
    responseText: {
        type: String,
        default: "",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("ImageHistory", imageHistorySchema);
