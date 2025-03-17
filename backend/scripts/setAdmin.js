const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const ADMIN_EMAIL = "whyiswhen@gmail.com";

async function setAdmin() {
    try {
        // Connect to MongoDB
        console.log("MongoDB URI:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Find user by email
        const user = await User.findOne({ email: ADMIN_EMAIL });

        if (!user) {
            console.log(
                `User with email ${ADMIN_EMAIL} not found. Creating admin user...`
            );

            // Create new admin user if not exists
            const newAdmin = new User({
                email: ADMIN_EMAIL,
                password: "Admin@123", // Default password, should be changed after first login
                isVerified: true,
                isAdmin: true,
            });

            await newAdmin.save();
            console.log(`Admin user created with email: ${ADMIN_EMAIL}`);
        } else {
            // Update existing user to be admin
            user.isAdmin = true;
            await user.save();
            console.log(`User ${ADMIN_EMAIL} has been set as admin`);
        }

        mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error setting admin:", error);
        process.exit(1);
    }
}

setAdmin();
