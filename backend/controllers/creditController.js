const Razorpay = require("razorpay");
const crypto = require("crypto");
const Credit = require("../models/Credit");
const Transaction = require("../models/Transaction");

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Get user's credit balance
const getUserCredits = async (req, res) => {
    try {
        let credit = await Credit.findOne({ user: req.user._id });

        if (!credit) {
            // Create new credit record for user if it doesn't exist
            credit = await Credit.create({
                user: req.user._id,
                balance: 100, // Initial free credits
                lastFreeCreditsDate: new Date(),
            });
        }

        res.json({ balance: credit.balance });
    } catch (error) {
        res.status(500).json({ error: "Error fetching credits" });
    }
};

// Create order for credit purchase
const createOrder = async (req, res) => {
    try {
        const { amount } = req.body; // Amount in rupees
        const credits = amount * 5; // 5 credits per rupee

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: `order_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // Create transaction record
        const transaction = await Transaction.create({
            user: req.user._id,
            amount,
            credits,
            orderId: order.id,
            status: "pending",
        });

        res.json({
            orderId: order.id,
            amount: options.amount,
            currency: options.currency,
        });
    } catch (error) {
        res.status(500).json({ error: "Error creating order" });
    }
};

// Verify payment and add credits
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
            req.body;

        // Verify signature
        const shasum = crypto.createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
        );
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest("hex");

        if (digest !== razorpay_signature) {
            return res.status(400).json({ error: "Invalid payment signature" });
        }

        // Find and update transaction
        const transaction = await Transaction.findOne({
            orderId: razorpay_order_id,
        });
        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        transaction.status = "completed";
        transaction.paymentId = razorpay_payment_id;
        await transaction.save();

        // Add credits to user's balance
        const credit = await Credit.findOne({ user: req.user._id });
        if (!credit) {
            return res.status(404).json({ error: "Credit record not found" });
        }

        credit.balance += transaction.credits;
        await credit.save();

        res.json({
            success: true,
            message: "Payment verified and credits added",
            credits: credit.balance,
        });
    } catch (error) {
        res.status(500).json({ error: "Error verifying payment" });
    }
};

// Get transaction history
const getTransactionHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: "Error fetching transaction history" });
    }
};

module.exports = {
    getUserCredits,
    createOrder,
    verifyPayment,
    getTransactionHistory,
};
