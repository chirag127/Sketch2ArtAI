const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { promisify } = require("util");
require("dotenv").config();

// Promisify fs functions
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json());

// Handle preflight requests
app.options("*", cors());

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
app.post("/api/convert", upload.single("sketch"), async (req, res) => {
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

        if (!req.file && !req.body.base64Data) {
            console.error("Error: No file or base64 data provided");
            return res.status(400).json({
                error: "No file or base64 data uploaded",
                receivedKeys: Object.keys(req.body),
                fileReceived: !!req.file,
            });
        }

        // Get style and custom prompt
        const style = req.body.style || "Anime"; // Default style is Anime
        const customPrompt = req.body.customPrompt || ""; // Get custom prompt if provided

        if (req.file) {
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
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp-image-generation",
        });

        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            response_modalities: ["text", "image"],
            responseMimeType: "text/plain",
        };

        // Start chat session
        const chatSession = model.startChat({
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

        // Send message to convert sketch
        let promptMessage = `Convert this sketch into ${style} style art`;

        // Add custom prompt if provided
        if (customPrompt) {
            promptMessage = `${promptMessage}- additional prompt: ${customPrompt}`;
        }

        console.log("Sending prompt to AI:", promptMessage);

        const result = await chatSession.sendMessage(promptMessage);
        // console.log(result);

        try {
            console.log(result.response.text());
        } catch (error) {
            console.error("Error logging response text:", error);
        }
        let inlineData;
        try {
            // Extract the image data
            inlineData =
                result.response.candidates[0].content.parts[0].inlineData;
        } catch (error) {
            console.error("Error extracting inlineData:", error);
            return res.status(500).json({
                error: "Failed to extract inlineData",
                details: error.message,
            });
        }

        const imageData = inlineData.data;

        // Save the image to a file
        const outputDir = path.join(__dirname, "outputs");
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, `output_${Date.now()}.png`);
        const data = Buffer.from(imageData, "base64");
        fs.writeFileSync(outputPath, data);

        // Return the image data to the client
        res.json({
            success: true,
            imageData: `data:${inlineData.mimeType};base64,${imageData}`,
            message: "Sketch converted successfully",
        });
    } catch (error) {
        console.error("Error processing sketch:", error);
        res.status(500).json({
            error: "Failed to process sketch",
            details: error.message,
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
