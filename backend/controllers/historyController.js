const ImageHistory = require("../models/ImageHistory");

/**
 * Get image history with pagination
 */
const getHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count for pagination info
        const totalCount = await ImageHistory.countDocuments({
            user: req.user._id,
        });

        const history = await ImageHistory.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            history,
            pagination: {
                total: totalCount,
                page,
                limit,
                pages: Math.ceil(totalCount / limit),
                hasMore: skip + history.length < totalCount,
            },
        });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({
            error: "Failed to fetch history",
            details: error.message,
        });
    }
};

/**
 * Delete a history item
 */
const deleteHistoryItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the history item
        const historyItem = await ImageHistory.findById(id);

        // Check if history item exists
        if (!historyItem) {
            return res.status(404).json({ error: "History item not found" });
        }

        // Check if user owns the history item
        if (
            historyItem.user &&
            historyItem.user.toString() !== req.user._id.toString()
        ) {
            return res
                .status(403)
                .json({ error: "Not authorized to delete this history item" });
        }

        await ImageHistory.findByIdAndDelete(id);
        res.json({
            success: true,
            message: "History item deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting history item:", error);
        res.status(500).json({
            error: "Failed to delete history item",
            details: error.message,
        });
    }
};

module.exports = {
    getHistory,
    deleteHistoryItem,
};
