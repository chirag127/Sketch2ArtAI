const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Initialize Google Generative AI
 */
const initializeGemini = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI;
};

/**
 * Get Gemini model with fallback
 */
const getGeminiModel = (genAI) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp-image-generation",
        });
        console.log("Using model: gemini-2.0-flash-exp-image-generation");
        return model;
    } catch (error) {
        console.error(
            "Error with primary model, trying fallback:",
            error.message
        );
        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
            });
            console.log("Using fallback model: gemini-1.5-flash");
            return model;
        } catch (fallbackError) {
            console.error("Error with fallback model:", fallbackError.message);
            throw new Error(
                `Failed to initialize Gemini model: ${error.message}`
            );
        }
    }
};

/**
 * Default generation configuration for Gemini
 */
const defaultGenerationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    response_modalities: ["text", "image"],
    responseMimeType: "text/plain",
};

module.exports = {
    initializeGemini,
    getGeminiModel,
    defaultGenerationConfig,
};
