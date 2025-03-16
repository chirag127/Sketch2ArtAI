const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

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
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const mimeType = req.file.mimetype;
        const style = req.body.style || "Anime"; // Default style is Anime

        // Read file as base64
        const fileBase64 = await readFileAsBase64(filePath);

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
        const result = await chatSession.sendMessage(
            `Convert this sketch into ${style} style art`
        );
        console.log(result);

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
