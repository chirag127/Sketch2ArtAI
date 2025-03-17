const User = require("../models/User");

const admin = async (req, res, next) => {
    try {
        // Check if user exists and is admin
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ error: "Admin access required" });
        }

        next();
    } catch (error) {
        res.status(403).json({ error: "Admin authentication failed" });
    }
};

module.exports = admin;
