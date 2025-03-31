const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Credit = require("../models/Credit");
const Transaction = require("../models/Transaction");

// Razorpay webhook handler
router.post("/razorpay", async (req, res) => {
    try {
        // Verify webhook signature
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers["x-razorpay-signature"];

        const shasum = crypto.createHmac("sha256", webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");

        if (signature !== digest) {
            return res.status(400).json({ error: "Invalid webhook signature" });
        }

        const { payload } = req.body;
        const { payment } = payload;

        if (payment.entity.status === "captured") {
            // Find the transaction
            const transaction = await Transaction.findOne({
                orderId: payment.entity.order_id,
            });

            if (!transaction) {
                return res.status(404).json({ error: "Transaction not found" });
            }

            // Update transaction status if not already completed
            if (transaction.status !== "completed") {
                transaction.status = "completed";
                transaction.paymentId = payment.entity.id;
                await transaction.save();

                // Add credits to user's balance
                const credit = await Credit.findOne({ user: transaction.user });
                if (credit) {
                    credit.balance += transaction.credits;
                    await credit.save();
                }
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({ error: "Webhook processing failed" });
    }
});

module.exports = router;
