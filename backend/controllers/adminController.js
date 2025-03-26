const ImageHistory = require("../models/ImageHistory");
const { cleanupOldFiles } = require("../utils/fileUtils");
const path = require("path");

/**
 * Get all users' history for admin
 */
const getAdminHistory = async (req, res) => {
    try {
        const history = await ImageHistory.find({})
            .sort({ createdAt: -1 })
            .populate("user", "email")
            .limit(100);
        res.json(history);
    } catch (error) {
        console.error("Error fetching admin history:", error);
        res.status(500).json({
            error: "Failed to fetch admin history",
            details: error.message,
        });
    }
};

/**
 * Manually trigger cleanup of uploads and outputs directories
 */
const cleanupFiles = async (req, res) => {
    try {
        const uploadsDir = path.join(__dirname, "..", "uploads");
        const outputsDir = path.join(__dirname, "..", "outputs");

        await cleanupOldFiles(uploadsDir, 0); // Delete all files
        await cleanupOldFiles(outputsDir, 0); // Delete all files

        res.json({
            success: true,
            message: "All files cleaned up successfully",
        });
    } catch (error) {
        console.error("Error during manual cleanup:", error);
        res.status(500).json({
            error: "Failed to clean up files",
            details: error.message,
        });
    }
};

module.exports = {
    getAdminHistory,
    cleanupFiles,
};
