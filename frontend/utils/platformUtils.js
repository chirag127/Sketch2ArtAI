import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";

/**
 * Utility functions that handle platform-specific behavior
 * to make the app work on both web and native platforms
 */

/**
 * Get file info in a platform-compatible way
 * @param {string} uri - The URI of the file
 * @returns {Promise<object>} - File info object
 */
export const getFileInfo = async (uri) => {
    // On web, we can't use FileSystem.getInfoAsync, so we return a minimal object
    if (Platform.OS === "web") {
        return {
            exists: true,
            uri: uri,
            size: 0, // We don't know the size on web
            isDirectory: false,
        };
    }

    // On native platforms, use the normal FileSystem API
    return await FileSystem.getInfoAsync(uri);
};

/**
 * Get file extension from URI
 * @param {string} uri - The URI of the file
 * @returns {string} - The file extension (e.g., 'jpg', 'png')
 */
export const getFileExtension = (uri) => {
    // Extract extension from the URI
    const parts = uri.split(".");
    const extension = parts.length > 1 ? parts.pop().toLowerCase() : "jpg";

    // Handle data URIs for web
    if (uri.startsWith("data:image/")) {
        const mimeType = uri.split(";")[0].split(":")[1];
        if (mimeType === "image/png") return "png";
        if (mimeType === "image/jpeg") return "jpg";
        if (mimeType === "image/gif") return "gif";
        return "jpg"; // Default to jpg
    }

    return extension;
};

/**
 * Get MIME type from file extension
 * @param {string} extension - The file extension
 * @returns {string} - The MIME type
 */
export const getMimeType = (extension) => {
    switch (extension.toLowerCase()) {
        case "png":
            return "image/png";
        case "gif":
            return "image/gif";
        case "jpg":
        case "jpeg":
            return "image/jpeg";
        default:
            return "image/jpeg";
    }
};

/**
 * Share an image in a platform-compatible way
 * @param {string} imageUri - The URI of the image to share
 * @param {string} base64Data - The base64 data of the image (for web)
 * @param {string} shareContent - Optional text content to share with the image
 * @returns {Promise<void>}
 */
export const shareImage = async (imageUri, base64Data, shareContent = "") => {
    if (Platform.OS === "web") {
        try {
            // Try to use the Web Share API if available
            if (navigator.share) {
                // Convert base64 to blob for sharing
                const response = await fetch(imageUri);
                const blob = await response.blob();
                const file = new File([blob], "sketch2art.png", {
                    type: "image/png",
                });

                await navigator.share({
                    title: "Sketch2ArtAI Creation",
                    text: shareContent,
                    files: [file],
                });
                return;
            }
        } catch (error) {
            console.error("Web Share API error:", error);
            // Fall back to download if sharing fails
        }

        // Fallback: create a download link
        const link = document.createElement("a");
        link.href = imageUri;
        link.download = "sketch2art.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
    }

    // On native platforms, use Sharing API
    const { shareAsync } = await import("expo-sharing");
    await shareAsync(imageUri, {
        mimeType: "image/png",
        dialogTitle: "Share your converted art",
        UTI: "public.png",
        message: shareContent, // Include the share content as a message
    });
};

/**
 * Save base64 data to a file in a platform-compatible way
 * @param {string} base64Data - The base64 data to save
 * @param {string} filename - The filename to save as
 * @returns {Promise<string>} - The URI of the saved file
 */
export const saveBase64ToFile = async (base64Data, filename) => {
    if (Platform.OS === "web") {
        // On web, we can't save to a file, so we return the data URI
        return `data:image/png;base64,${base64Data}`;
    }

    // On native platforms, save to a file
    const filePath = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
    });

    return filePath;
};
