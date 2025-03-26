const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
    getFeedItems,
    shareToFeed,
    removeFromFeed,
    removeFromFeedByHistoryId,
} = require("../controllers/feedController");

// API endpoint to get public feed items
router.get("/", getFeedItems);

// API endpoint to share a history item to the public feed
router.post("/share/:historyId", auth, shareToFeed);

// API endpoint to remove an item from the public feed by feed item ID
router.delete("/:id", auth, removeFromFeed);

// API endpoint to remove an item from the public feed by history item ID
router.delete("/byhistory/:historyId", auth, removeFromFeedByHistoryId);

module.exports = router;
