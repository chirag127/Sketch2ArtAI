const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
    getHistory,
    deleteHistoryItem,
} = require("../controllers/historyController");

// API endpoint to get image history with pagination
router.get("/", auth, getHistory);

// API endpoint to delete a history item
router.delete("/:id", auth, deleteHistoryItem);

module.exports = router;
