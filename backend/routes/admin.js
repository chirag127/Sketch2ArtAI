const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const {
    getAdminHistory,
    cleanupFiles,
} = require("../controllers/adminController");
const Credit = require("../models/Credit");

// API endpoint for admin to get all users' history
router.get("/history", auth, admin, getAdminHistory);

// Endpoint to manually trigger cleanup
router.post("/cleanup", auth, admin, cleanupFiles);

// Get all users' credit balances
router.get("/credits", auth, admin, async (req, res) => {
    try {
        const credits = await Credit.find().populate("user", "email name");
        res.json(credits);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch credit balances" });
    }
});

// Adjust user credits
router.post("/credits/:userId", auth, admin, async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.params.userId;

        if (typeof amount !== "number") {
            return res.status(400).json({ error: "Amount must be a number" });
        }

        let credit = await Credit.findOne({ user: userId });

        if (!credit) {
            credit = new Credit({
                user: userId,
                balance: amount,
                lastFreeCreditsDate: new Date(),
            });
        } else {
            credit.balance += amount;
        }

        await credit.save();
        res.json({
            message: "Credits adjusted successfully",
            balance: credit.balance,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to adjust credits" });
    }
});

// Force renew monthly credits for all users
router.post("/credits/renew/all", auth, admin, async (req, res) => {
    try {
        const { renewAllUserCredits } = require("../tasks/creditRenewal");
        await renewAllUserCredits();
        res.json({ message: "Credits renewed successfully for all users" });
    } catch (error) {
        res.status(500).json({ error: "Failed to renew credits" });
    }
});

module.exports = router;
