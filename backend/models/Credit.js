const mongoose = require("mongoose");

const creditSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    balance: {
        type: Number,
        default: 1000, // Initial free credits
        required: true,
    },
    lastFreeCreditsDate: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Credit", creditSchema);
