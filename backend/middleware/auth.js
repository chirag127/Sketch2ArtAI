const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ error: "Authentication required" });
        }

        console.log(
            "Auth middleware - Received token:",
            token.substring(0, 10) + "..."
        );

        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || "your-secret-key"
            );
            console.log(
                "Auth middleware - Token decoded successfully, userId:",
                decoded.userId
            );

            const user = await User.findById(decoded.userId);

            if (!user) {
                console.log(
                    "Auth middleware - User not found for userId:",
                    decoded.userId
                );
                return res.status(401).json({ error: "User not found" });
            }

            if (!user.isVerified) {
                console.log(
                    "Auth middleware - User email not verified:",
                    user.email
                );
                return res.status(401).json({ error: "Email not verified" });
            }

            req.user = user;
            req.token = token;
            console.log(
                "Auth middleware - Authentication successful for user:",
                user.email
            );
            next();
        } catch (jwtError) {
            console.error(
                "Auth middleware - JWT verification error:",
                jwtError.message
            );
            return res
                .status(401)
                .json({ error: "Invalid token", details: jwtError.message });
        }
    } catch (error) {
        console.error("Auth middleware - General error:", error.message);
        res.status(401).json({
            error: "Authentication failed",
            details: error.message,
        });
    }
};

module.exports = auth;
