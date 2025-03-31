const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const creditController = require("../controllers/creditController");

// Get user's credit balance
router.get("/balance", auth, creditController.getUserCredits);

// Create order for credit purchase
router.post("/order", auth, creditController.createOrder);

// Verify payment and add credits
router.post("/verify", auth, creditController.verifyPayment);

// Get transaction history
router.get("/transactions", auth, creditController.getTransactionHistory);

module.exports = router;
