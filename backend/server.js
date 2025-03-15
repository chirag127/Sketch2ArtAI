const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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
const fileManager = new GoogleAIFileManager(apiKey);

// Upload file to Gemini
async function uploadToGemini(filePath, mimeType) {
    try {
        const uploadResult = await fileManager.uploadFile(filePath, {
            mimeType,
            displayName: path.basename(filePath),
        });
        const file = uploadResult.file;
        console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
        return file;
    } catch (error) {
        console.error("Error uploading to Gemini:", error);
        throw error;
    }
}

// API endpoint for sketch to art conversion
app.post("/api/convert", upload.single("sketch"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const mimeType = req.file.mimetype;
        const style = req.body.style || "Anime"; // Default style is Anime

        // Upload the file to Gemini
        const file = await uploadToGemini(filePath, mimeType);

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
                            fileData: {
                                mimeType: file.mimeType,
                                fileUri: file.uri,
                            },
                        },
                    ],
                },
            ],
        });

        // Send message to convert sketch
        const result = await chatSession.sendMessage(
            `Convert this sketch into ${style} style art`
        );

        // Extract the image data
        const inlineData =
            result.response.candidates[0].content.parts[0].inlineData;
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

// Serve static files from the outputs directory
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
