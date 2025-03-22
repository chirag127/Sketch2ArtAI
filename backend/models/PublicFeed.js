const mongoose = require("mongoose");

const publicFeedSchema = new mongoose.Schema({
    originalImageUrl: {
        type: String,
        default: "", // Make it optional for custom prompt only requests
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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // Reference to the original history item
    historyItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ImageHistory",
        required: true,
    },
});

module.exports = mongoose.model("PublicFeed", publicFeedSchema);
