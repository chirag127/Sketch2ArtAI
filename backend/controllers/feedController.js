const PublicFeed = require("../models/PublicFeed");
const ImageHistory = require("../models/ImageHistory");

/**
 * Get public feed items
 */
const getFeedItems = async (req, res) => {
    try {
        const feedItems = await PublicFeed.find({})
            .sort({ createdAt: -1 })
            .populate("user", "email")
            .limit(50);
        res.json(feedItems);
    } catch (error) {
        console.error("Error fetching public feed:", error);
        res.status(500).json({
            error: "Failed to fetch public feed",
            details: error.message,
        });
    }
};

/**
 * Share a history item to the public feed
 */
const shareToFeed = async (req, res) => {
    try {
        const { historyId } = req.params;
        console.log(
            `Share to feed request received for historyId: ${historyId}`
        );
        console.log(`User ID from auth: ${req.user._id}`);

        // Find the history item
        const historyItem = await ImageHistory.findById(historyId);

        // Check if history item exists
        if (!historyItem) {
            console.log(`History item not found with ID: ${historyId}`);
            return res.status(404).json({ error: "History item not found" });
        }

        console.log(
            `Found history item: ${historyItem._id}, owned by user: ${historyItem.user}`
        );

        // Check if user owns the history item
        if (
            historyItem.user &&
            historyItem.user.toString() !== req.user._id.toString()
        ) {
            console.log(
                `Authorization failed: Item owned by ${historyItem.user}, request from ${req.user._id}`
            );
            return res
                .status(403)
                .json({ error: "Not authorized to share this history item" });
        }

        // Check if already shared
        if (historyItem.isSharedToFeed) {
            console.log(`Item ${historyId} is already shared to feed`);
            return res
                .status(400)
                .json({ error: "Item already shared to feed" });
        }

        // Create a new feed item
        const feedItem = new PublicFeed({
            originalImageUrl: historyItem.originalImageUrl,
            convertedImageUrl: historyItem.convertedImageUrl,
            style: historyItem.style,
            prompt: historyItem.prompt,
            user: req.user._id,
            historyItem: historyItem._id,
        });

        console.log(`Created new feed item, saving to database...`);
        await feedItem.save();
        console.log(`Feed item saved with ID: ${feedItem._id}`);

        // Update the history item to mark as shared
        historyItem.isSharedToFeed = true;
        await historyItem.save();
        console.log(`Updated history item ${historyId} to mark as shared`);

        res.json({
            success: true,
            message: "Item shared to public feed successfully",
            feedItem,
        });
        console.log(`Successfully shared item ${historyId} to feed`);
    } catch (error) {
        console.error("Error sharing to public feed:", error);
        res.status(500).json({
            error: "Failed to share to public feed",
            details: error.message,
        });
    }
};

/**
 * Remove an item from the public feed by feed item ID
 */
const removeFromFeed = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Removing feed item with ID: ${id}`);

        // Find the feed item
        const feedItem = await PublicFeed.findById(id);

        // Check if feed item exists
        if (!feedItem) {
            console.log(`Feed item not found with ID: ${id}`);
            return res.status(404).json({ error: "Feed item not found" });
        }

        console.log(
            `Found feed item: ${feedItem._id}, owned by user: ${feedItem.user}`
        );

        // Log detailed comparison information
        console.log({
            feedItemUserId: feedItem.user.toString(),
            requestUserId: req.user._id.toString(),
            isAdmin: req.user.isAdmin,
            isMatch: feedItem.user.toString() === req.user._id.toString(),
        });

        // Check if user owns the feed item or is admin
        const isAdmin = req.user.isAdmin === true;
        const isOwner = feedItem.user.toString() === req.user._id.toString();

        console.log(
            `Authorization check: isAdmin=${isAdmin}, isOwner=${isOwner}`
        );

        if (!isAdmin && !isOwner) {
            console.log(
                `Authorization failed: Item owned by ${feedItem.user}, request from ${req.user._id}`
            );
            return res
                .status(403)
                .json({ error: "Not authorized to remove this feed item" });
        }

        // Find the associated history item and update it
        const historyItem = await ImageHistory.findById(feedItem.historyItem);
        if (historyItem) {
            console.log(
                `Updating history item ${historyItem._id} to mark as not shared`
            );
            historyItem.isSharedToFeed = false;
            await historyItem.save();
        }

        // Delete the feed item
        console.log(`Deleting feed item ${id}`);
        await PublicFeed.findByIdAndDelete(id);

        console.log(`Successfully removed feed item ${id}`);
        res.json({
            success: true,
            message: "Item removed from public feed successfully",
        });
    } catch (error) {
        console.error("Error removing from public feed:", error);
        res.status(500).json({
            error: "Failed to remove from public feed",
            details: error.message,
        });
    }
};

/**
 * Remove an item from the public feed by history item ID
 */
const removeFromFeedByHistoryId = async (req, res) => {
    try {
        const { historyId } = req.params;
        console.log(`Removing feed item by history ID: ${historyId}`);

        // Find the feed item that references this history item
        const feedItem = await PublicFeed.findOne({ historyItem: historyId });

        // Check if feed item exists
        if (!feedItem) {
            console.log(`No feed item found for history ID: ${historyId}`);
            return res
                .status(404)
                .json({ error: "Feed item not found for this history item" });
        }

        console.log(
            `Found feed item: ${feedItem._id}, owned by user: ${feedItem.user}`
        );

        // Log detailed comparison information
        console.log({
            feedItemUserId: feedItem.user.toString(),
            requestUserId: req.user._id.toString(),
            isAdmin: req.user.isAdmin,
            isMatch: feedItem.user.toString() === req.user._id.toString(),
        });

        // Check if user owns the feed item or is admin
        const isAdmin = req.user.isAdmin === true;
        const isOwner = feedItem.user.toString() === req.user._id.toString();

        console.log(
            `Authorization check: isAdmin=${isAdmin}, isOwner=${isOwner}`
        );

        if (!isAdmin && !isOwner) {
            console.log(
                `Authorization failed: Item owned by ${feedItem.user}, request from ${req.user._id}`
            );
            return res
                .status(403)
                .json({ error: "Not authorized to remove this feed item" });
        }

        // Find the associated history item and update it
        const historyItem = await ImageHistory.findById(historyId);
        if (historyItem) {
            console.log(
                `Updating history item ${historyId} to mark as not shared`
            );
            historyItem.isSharedToFeed = false;
            await historyItem.save();
        }

        // Delete the feed item
        console.log(`Deleting feed item ${feedItem._id}`);
        await PublicFeed.findByIdAndDelete(feedItem._id);

        console.log(
            `Successfully removed feed item for history ID ${historyId}`
        );
        res.json({
            success: true,
            message: "Item removed from public feed successfully",
        });
    } catch (error) {
        console.error("Error removing from public feed by history ID:", error);
        res.status(500).json({
            error: "Failed to remove from public feed",
            details: error.message,
        });
    }
};

module.exports = {
    getFeedItems,
    shareToFeed,
    removeFromFeed,
    removeFromFeedByHistoryId,
};
