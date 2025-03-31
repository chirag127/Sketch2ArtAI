// // Change this to your computer's IP address when testing on a physical device
// export const API_URL = "http://192.168.31.232:4000/api"; // Use your backend server IP and port
// // export const API_URL = "https://sketch2artai.onrender.com/api";

const dev = {

    apiUrl: "http://192.168.31.232:4000/api" // Example configuration
};
const prod = {
    apiUrl: "https://sketch2artai.onrender.com/api" // Example configuration
};
const config = process.env.NODE_ENV === "development" ? dev : prod; // Determine the environment
export const API_URL = config.apiUrl; // Use the appropriate API URL based on the environment
export const APP_NAME = "Sketch2ArtAI"; // Example app name, can be used in the app header or title