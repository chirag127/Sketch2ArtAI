const mongoose = require("mongoose");

const imageHistorySchema = new mongoose.Schema({
    originalImageUrl: {
        type: String,
        default: "", // Make it optional for custom prompt only requests
    },
    convertedImageUrl: {
        type: String,
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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // Track if this item is shared to the public feed
    isSharedToFeed: {
        type: Boolean,
        default: false,
    },
    isCustomPromptOnly: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("ImageHistory", imageHistorySchema);
