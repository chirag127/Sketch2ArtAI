const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const auth = require("../middleware/auth");

// Generate random verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register a new user
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email and password are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Generate verification code
        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        // Create new user
        const user = new User({
            email,
            password,
            verificationCode,
            verificationCodeExpires,
        });

        await user.save();

        // Send verification email
        const emailHtml = `
            <h1>Email Verification</h1>
            <p>Thank you for registering with Sketch2ArtAI. Please use the following code to verify your email:</p>
            <h2>${verificationCode}</h2>
            <p>This code will expire in 30 minutes.</p>
        `;

        await sendEmail(email, "Verify Your Email - Sketch2ArtAI", emailHtml);

        res.status(201).json({
            message:
                "User registered successfully. Please check your email for verification code.",
            userId: user._id,
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            error: "Registration failed",
            details: error.message,
        });
    }
});

// Verify email
router.post("/verify", async (req, res) => {
    try {
        const { email, code } = req.body;

        // Validate input
        if (!email || !code) {
            return res
                .status(400)
                .json({ error: "Email and verification code are required" });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if already verified
        if (user.isVerified) {
            return res.status(400).json({ error: "Email already verified" });
        }

        // Check verification code
        if (user.verificationCode !== code) {
            return res.status(400).json({ error: "Invalid verification code" });
        }

        // Check if code is expired
        if (user.verificationCodeExpires < new Date()) {
            return res.status(400).json({ error: "Verification code expired" });
        }

        // Update user
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
        );

        res.json({
            message: "Email verified successfully",
            token,
            user: {
                id: user._id,
                email: user.email,
                isVerified: user.isVerified,
                isAdmin: user.isAdmin,
            },
        });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({
            error: "Verification failed",
            details: error.message,
        });
    }
});

// Resend verification code
router.post("/resend-verification", async (req, res) => {
    try {
        const { email } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if already verified
        if (user.isVerified) {
            return res.status(400).json({ error: "Email already verified" });
        }

        // Generate new verification code
        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        // Update user
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = verificationCodeExpires;
        await user.save();

        // Send verification email
        const emailHtml = `
            <h1>Email Verification</h1>
            <p>Please use the following code to verify your email:</p>
            <h2>${verificationCode}</h2>
            <p>This code will expire in 30 minutes.</p>
        `;

        await sendEmail(email, "Verify Your Email - Sketch2ArtAI", emailHtml);

        res.json({
            message: "Verification code resent successfully",
        });
    } catch (error) {
        console.error("Resend verification error:", error);
        res.status(500).json({
            error: "Failed to resend verification code",
            details: error.message,
        });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email and password are required" });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(401).json({
                error: "Email not verified",
                needsVerification: true,
                userId: user._id,
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                isVerified: user.isVerified,
                isAdmin: user.isAdmin,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed", details: error.message });
    }
});

// Get current user
router.get("/me", auth, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                email: req.user.email,
                isVerified: req.user.isVerified,
                isAdmin: req.user.isAdmin,
            },
        });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({
            error: "Failed to get user",
            details: error.message,
        });
    }
});

module.exports = router;
