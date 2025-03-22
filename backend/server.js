const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { promisify } = require("util");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { uploadToFreeImageHost } = require("./utils/imageUpload");
require("dotenv").config();

// Import models
const ImageHistory = require("./models/ImageHistory");
const User = require("./models/User");
const PublicFeed = require("./models/PublicFeed");

// Import middleware
const auth = require("./middleware/auth");
const admin = require("./middleware/admin");

// Import routes
const authRoutes = require("./routes/auth");

// Promisify fs functions
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        exposedHeaders: ["Access-Control-Allow-Origin"],
    })
);
app.use(express.json());

// Handle preflight requests
app.options("*", cors());

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
});

// Use auth routes
app.use("/api/auth", authRoutes);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Initialize Google Generative AI
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Function to read file as base64
async function readFileAsBase64(filePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        return fileBuffer.toString("base64");
    } catch (error) {
        console.error("Error reading file:", error);
        throw error;
    }
}

// API endpoint for sketch to art conversion
app.post("/api/convert", auth, upload.single("sketch"), async (req, res) => {
    try {
        console.log("Received convert request");
        console.log("Request body keys:", Object.keys(req.body));
        console.log("Request file:", req.file ? "File received" : "No file");
        console.log("Has base64Data:", req.body.base64Data ? "Yes" : "No");
        console.log("Has mimeType:", req.body.mimeType ? "Yes" : "No");
        console.log("Has style:", req.body.style ? "Yes" : "No");

        // Enable CORS for web clients
        res.header("Access-Control-Allow-Origin", "*");
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept"
        );

        let fileBase64;
        let mimeType;

        // Check if this is a custom prompt only request or if the style is "Custom Prompt Only"
        const isCustomPromptOnly = req.body.customPromptOnly === 'true' || req.body.style === 'Custom Prompt Only';

        if (!isCustomPromptOnly && !req.file && !req.body.base64Data) {
            console.error("Error: No file or base64 data provided");
            return res.status(400).json({
                error: "No file or base64 data uploaded",
                receivedKeys: Object.keys(req.body),
                fileReceived: !!req.file,
            });
        }

        // Get style and custom prompt
        let style = req.body.style || "Anime"; // Default style is Anime
        const customPrompt = req.body.customPrompt || ""; // Get custom prompt if provided

        // If style is "Custom Prompt Only", use a generic style for the AI
        if (style === "Custom Prompt Only") {
            style = "realistic";
        }

        // Handle custom prompt only requests
        if (isCustomPromptOnly) {
            console.log("Processing custom prompt only request");
            // No image data needed for custom prompt only
            fileBase64 = null;
            mimeType = null;
            console.log("Custom prompt only request - skipping image processing");
        } else if (req.file) {
            // Handle file upload (from native platforms)
            const filePath = req.file.path;
            mimeType = req.file.mimetype;

            // Read file as base64
            fileBase64 = await readFileAsBase64(filePath);
        } else if (req.body.base64Data) {
            // Handle base64 data directly (from web platform)
            console.log("Using base64 data from request body");
            fileBase64 = req.body.base64Data;
            mimeType = req.body.mimeType || "image/png";
            console.log("Base64 data length:", fileBase64.length);
            console.log("Using mime type:", mimeType);
        } else {
            console.error(
                "Error: Unexpected state - no file and no base64Data but passed initial check"
            );
            return res.status(400).json({ error: "Invalid request format" });
        }

        // Set up the model
        console.log("Setting up Gemini model...");

        // Try different model names if one fails
        let model;
        try {
            model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash-exp-image-generation",
            });
            console.log("Using model: gemini-2.0-flash-exp-image-generation");
        } catch (error) {
            console.error(
                "Error with primary model, trying fallback:",
                error.message
            );
            try {
                model = genAI.getGenerativeModel({
                    model: "gemini-1.5-flash",
                });
                console.log("Using fallback model: gemini-1.5-flash");
            } catch (fallbackError) {
                console.error(
                    "Error with fallback model:",
                    fallbackError.message
                );
                throw new Error(
                    `Failed to initialize Gemini model: ${error.message}`
                );
            }
        }

        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            response_modalities: ["text", "image"],
            responseMimeType: "text/plain",
        };

        console.log("Generation config:", generationConfig);

        // Start chat session
        let chatSession;
        let promptMessage;

        if (isCustomPromptOnly) {
            // For custom prompt only, don't include image data
            chatSession = model.startChat({
                generationConfig,
            });

            // For custom prompt only, use a different base prompt
            promptMessage = `Generate an image in ${style} style`;
        } else {
            // For image-based requests, include the image in history
            chatSession = model.startChat({
                generationConfig,
                history: [
                    {
                        role: "user",
                        parts: [
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: fileBase64,
                                },
                            },
                        ],
                    },
                ],
            });

            // For image-based requests, use the sketch conversion prompt
            promptMessage = `Convert this sketch into ${style} style art`;
        }

        // For Custom Prompt Only style, use the custom prompt directly
        if (style === "Custom Prompt Only" || req.body.style === "Custom Prompt Only") {
            promptMessage = `Generate an image with the following prompt: ${customPrompt}`;
        } else if (customPrompt) {
            // Add custom prompt if provided
            promptMessage = `${promptMessage}- Additional prompt: ${customPrompt}`;
        }

        console.log("Sending prompt to AI:", promptMessage);

        console.log("Sending message to Gemini AI...");
        const result = await chatSession.sendMessage(promptMessage);

        console.log("Received response from Gemini AI");
        console.log("Response structure:", JSON.stringify(Object.keys(result)));

        if (!result || !result.response) {
            console.error("Error: No response from Gemini AI");
            return res.status(500).json({
                error: "No response from Gemini AI",
                details: "The AI model did not return a valid response",
            });
        }

        // Log response structure for debugging
        try {
            console.log(
                "Response candidates:",
                result.response.candidates
                    ? result.response.candidates.length
                    : 0
            );
            console.log("Response text:", result.response.text());
        } catch (error) {
            console.error("Error logging response text:", error);
        }

        // Detailed logging of the response structure
        console.log(
            "Response structure:",
            JSON.stringify(
                result.response,
                (key, value) => {
                    if (typeof value === "string" && value.length > 100) {
                        return value.substring(0, 100) + "... (truncated)";
                    }
                    return value;
                },
                2
            )
        );

        let inlineData = null;
        let imageData = null;
        let hasImage = false;

        try {
            // Check if we have candidates
            if (
                !result.response.candidates ||
                result.response.candidates.length === 0
            ) {
                throw new Error("No candidates in response");
            }

            // Check if we have content
            if (!result.response.candidates[0].content) {
                throw new Error("No content in first candidate");
            }

            // Check if we have parts
            if (
                !result.response.candidates[0].content.parts ||
                result.response.candidates[0].content.parts.length === 0
            ) {
                throw new Error("No parts in content");
            }

            // Find the part with inlineData
            const imagePart = result.response.candidates[0].content.parts.find(
                (part) => part.inlineData
            );

            if (!imagePart) {
                console.log(
                    "No image part found in response - this may be a text-only response"
                );
                // Continue without image data - we'll handle text-only responses
            } else {
                inlineData = imagePart.inlineData;
                imageData = inlineData.data;
                hasImage = true;

                // Save the image to a file
                const outputDir = path.join(__dirname, "outputs");
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }

                const outputPath = path.join(
                    outputDir,
                    `output_${Date.now()}.png`
                );
                const data = Buffer.from(imageData, "base64");
                fs.writeFileSync(outputPath, data);
            }
        } catch (error) {
            console.error("Error extracting inlineData:", error);
            // Don't return an error - we might still have a valid text response
            // Just log the error and continue
        }

        // Get the text response
        let responseText = "";
        try {
            // Check if we have a structured response (like the one provided in the message)
            if (
                result.response &&
                result.response.candidates &&
                result.response.candidates[0] &&
                result.response.candidates[0].content &&
                result.response.candidates[0].content.parts &&
                result.response.candidates[0].content.parts[0] &&
                result.response.candidates[0].content.parts[0].text
            ) {
                // Extract text from the structured response
                responseText =
                    result.response.candidates[0].content.parts[0].text;
                console.log(
                    "Extracted text from structured response:",
                    responseText
                );
            } else {
                // Fallback to the standard text() method
                responseText = result.response.text();
            }
            console.log("Sending response text to frontend:", responseText);
        } catch (error) {
            console.error("Error getting response text:", error);
            responseText = "No text response available";
        }

        // Upload images to free image host
        let originalImageUrl = "";
        let convertedImageUrl = "";

        try {
            // Upload original sketch if we have one (not for custom prompt only)
            if (!isCustomPromptOnly && fileBase64) {
                console.log("Uploading original sketch to image host...");
                originalImageUrl = await uploadToFreeImageHost(fileBase64);
            } else if (isCustomPromptOnly) {
                // For custom prompt only, no original image
                console.log("Custom prompt only request - skipping original image upload");
                originalImageUrl = "";
            } else {
                console.error("Error: No file data to upload");
                return res.status(400).json({ error: "No file data to upload" });
            }

            // Only upload converted art if we have an image
            if (hasImage && imageData) {
                console.log("Uploading converted art to image host...");
                convertedImageUrl = await uploadToFreeImageHost(imageData);
            }

            // Save to database
            const historyItem = new ImageHistory({
                originalImageUrl,
                convertedImageUrl,
                style,
                prompt: customPrompt || "",
                responseText,
                user: req.user._id, // Add user reference
                isCustomPromptOnly: isCustomPromptOnly, // Set the flag for custom prompt only requests
            });

            await historyItem.save();
            console.log("Saved to history database with ID:", historyItem._id);
        } catch (uploadError) {
            console.error("Error uploading images:", uploadError);
            // Continue even if upload fails
        }

        // Return the response to the client
        if (hasImage && imageData && inlineData) {
            // Return both image and text
            res.json({
                success: true,
                imageData: `data:${inlineData.mimeType};base64,${imageData}`,
                responseText: responseText,
                originalImageUrl,
                convertedImageUrl,
                message: "Sketch converted successfully",
                hasImage: true,
            });
        } else {
            // Return text-only response
            res.json({
                success: true,
                responseText: responseText,
                originalImageUrl,
                message: "Received text response from AI",
                hasImage: false,
            });
        }
    } catch (error) {
        console.error("Error processing sketch:", error);

        // Check if the error is related to the Gemini API
        if (error.message && error.message.includes("PERMISSION_DENIED")) {
            return res.status(403).json({
                error: "API key permission denied",
                details:
                    "The Gemini API key does not have permission to access the requested model or feature.",
                message: error.message,
            });
        }

        // Check if the error is related to invalid input
        if (error.message && error.message.includes("INVALID_ARGUMENT")) {
            return res.status(400).json({
                error: "Invalid input to Gemini API",
                details: "The input provided to the Gemini API was invalid.",
                message: error.message,
            });
        }

        // Generic error response
        res.status(500).json({
            error: "Failed to process sketch",
            details: error.message,
            stack: error.stack,
        });
    }
});

// Function to clean up old files
async function cleanupOldFiles(directory, maxAgeMs = 1 * 60 * 60 * 1000) {
    // Default: 1 hour
    try {
        // Create directory if it doesn't exist
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
            console.log(`Created directory: ${directory}`);
            return;
        }

        const now = Date.now();
        const files = await readdir(directory);

        for (const file of files) {
            const filePath = path.join(directory, file);
            const fileStat = await stat(filePath);

            // Skip directories
            if (fileStat.isDirectory()) continue;

            // Check if file is older than maxAgeMs
            if (now - fileStat.mtimeMs > maxAgeMs) {
                await unlink(filePath);
                console.log(`Deleted old file: ${filePath}`);
            }
        }
        console.log(`Cleanup completed for ${directory}`);
    } catch (error) {
        console.error(`Error cleaning up ${directory}:`, error);
    }
}

// Endpoint to manually trigger cleanup
app.post("/api/cleanup", cors(), async (req, res) => {
    try {
        const uploadsDir = path.join(__dirname, "uploads");
        const outputsDir = path.join(__dirname, "outputs");

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
});

// API endpoint to get image history
app.get("/api/history", auth, async (req, res) => {
    try {
        const history = await ImageHistory.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(history);
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({
            error: "Failed to fetch history",
            details: error.message,
        });
    }
});

// API endpoint for admin to get all users' history
app.get("/api/admin/history", auth, admin, async (req, res) => {
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
});

// API endpoint to delete a history item
app.delete("/api/history/:id", auth, async (req, res) => {
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
});

// API endpoint to get public feed items
app.get("/api/feed", async (req, res) => {
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
});

// API endpoint to share a history item to the public feed
app.post("/api/feed/share/:historyId", auth, async (req, res) => {
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
});

// API endpoint to remove an item from the public feed by feed item ID
app.delete("/api/feed/:id", auth, async (req, res) => {
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
});

// API endpoint to remove an item from the public feed by history item ID
app.delete("/api/feed/byhistory/:historyId", auth, async (req, res) => {
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
});

// Serve static files from the outputs directory
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);

    // Initial cleanup
    const uploadsDir = path.join(__dirname, "uploads");
    const outputsDir = path.join(__dirname, "outputs");

    cleanupOldFiles(uploadsDir);
    cleanupOldFiles(outputsDir);

    // Schedule periodic cleanup (every 30 minutes)
    setInterval(() => {
        cleanupOldFiles(uploadsDir);
        cleanupOldFiles(outputsDir);
    }, 30 * 60 * 1000); // 30 minutes
});
