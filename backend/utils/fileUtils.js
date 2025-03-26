const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

// Promisify fs functions
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const readFile = promisify(fs.readFile);

/**
 * Read file as base64
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} - Base64 encoded file content
 */
async function readFileAsBase64(filePath) {
    try {
        const fileBuffer = await readFile(filePath);
        return fileBuffer.toString("base64");
    } catch (error) {
        console.error("Error reading file:", error);
        throw error;
    }
}

/**
 * Clean up old files in a directory
 * @param {string} directory - Directory to clean
 * @param {number} maxAgeMs - Maximum age of files in milliseconds (default: 1 hour)
 */
async function cleanupOldFiles(directory, maxAgeMs = 1 * 60 * 60 * 1000) {
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

module.exports = {
    readFileAsBase64,
    cleanupOldFiles,
};
