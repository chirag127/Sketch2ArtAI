const cors = require("cors");

// CORS configuration middleware
const corsMiddleware = cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposedHeaders: ["Access-Control-Allow-Origin"],
});

module.exports = corsMiddleware;
