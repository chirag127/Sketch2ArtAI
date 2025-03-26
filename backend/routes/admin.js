const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const {
    getAdminHistory,
    cleanupFiles,
} = require("../controllers/adminController");

// API endpoint for admin to get all users' history
router.get("/history", auth, admin, getAdminHistory);

// Endpoint to manually trigger cleanup
router.post("/cleanup", auth, admin, cleanupFiles);

module.exports = router;
