const fs = require("fs");
const path = require("path");
const { uploadToFreeImageHost } = require("../utils/imageUpload");
const { readFileAsBase64 } = require("../utils/fileUtils");
const { getGeminiModel, defaultGenerationConfig } = require("../config/gemini");
const ImageHistory = require("../models/ImageHistory");
const Credit = require("../models/Credit");
const User = require("../models/User");
const { logCreditOperation } = require("../utils/creditLogger");

/**
 * Convert a sketch to art using Gemini AI
 */
const convertSketch = async (req, res) => {
    let creditDeducted = false;
    let credit;
    
    try {
        // Check user credits first
        credit = await Credit.findOne({ user: req.user._id });
        const isAdmin = req.user.isAdmin;

        if (!isAdmin) {
            if (!credit || credit.balance < 1) {
                return res.status(402).json({
                    error: "Insufficient credits",
                    creditsRequired: 1,
                    currentBalance: credit ? credit.balance : 0,
                });
            }

            // Use findOneAndUpdate with optimistic locking to prevent race conditions
            const updatedCredit = await Credit.findOneAndUpdate(
                { user: req.user._id, balance: { $gte: 1 } },
                { $inc: { balance: -1 } },
                { new: true }
            );

            if (!updatedCredit) {
                return res.status(402).json({
                    error: "Failed to deduct credits",
                    details: "Please try again"
                });
            }

            creditDeducted = true;
            credit = updatedCredit;
            console.log(`Deducted 1 credit from user ${req.user._id}. New balance: ${credit.balance}`);
            logCreditOperation(req.user._id, "deduct", 1, credit.balance);
        }

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
        const isCustomPromptOnly =
            req.body.customPromptOnly === "true" ||
            req.body.style === "Custom Prompt Only";

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
        const customPrompt =
            req.body.customPrompt || "Create a detailed and creative image"; // Custom prompt is now required

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
            console.log(
                "Custom prompt only request - skipping image processing"
            );
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
        const genAI = req.app.locals.genAI;
        const model = getGeminiModel(genAI);
        const generationConfig = defaultGenerationConfig;

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
        if (
            style === "Custom Prompt Only" ||
            req.body.style === "Custom Prompt Only"
        ) {
            promptMessage = `Generate an image with the following prompt: ${customPrompt}`;
        } else {
            // Always add custom prompt - now required for all conversions
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
                const outputDir = path.join(__dirname, "..", "outputs");
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
                console.log(
                    "Custom prompt only request - skipping original image upload"
                );
                originalImageUrl = "";
            } else {
                console.error("Error: No file data to upload");
                return res
                    .status(400)
                    .json({ error: "No file data to upload" });
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

        // Refund the credit if it was deducted and there was an error
        if (creditDeducted && !isAdmin) {
            try {
                const refundedCredit = await Credit.findOneAndUpdate(
                    { user: req.user._id },
                    { $inc: { balance: 1 } },
                    { new: true }
                );
                console.log(`Refunded 1 credit to user ${req.user._id}. New balance: ${refundedCredit.balance}`);
                logCreditOperation(req.user._id, "refund", 1, refundedCredit.balance);
            } catch (refundError) {
                console.error("Error refunding credit:", refundError);
            }
        }

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
};

module.exports = {
    convertSketch,
};
