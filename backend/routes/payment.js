const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Withdrawal = require("../models/Withdrawal");

// Initialize Stripe only if key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
}

// Create payment intent for deposit
router.post("/deposit", auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        message: "Payment gateway not configured. Please set STRIPE_SECRET_KEY",
      });
    }

    const { amount } = req.body;

    if (!amount || amount < 70 || amount > 50000) {
      return res.status(400).json({
        message: "Deposit amount must be between ₹70 and ₹50,000",
      });
    }

    // Create payment intent (amount in smallest currency unit - paise for INR)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: "inr",
      metadata: {
        userId: req.user._id.toString(),
        type: "deposit",
      },
    });

    // Create pending transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      type: "deposit",
      amount,
      status: "pending",
      stripePaymentIntentId: paymentIntent.id,
      description: `Deposit of ₹${amount}`,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: "inr",
    });
  } catch (error) {
    console.error("Create deposit error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Confirm payment and complete deposit
router.post("/confirm-deposit", auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        message: "Payment gateway not configured",
      });
    }

    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment intent ID required" });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        message: `Payment not completed. Status: ${paymentIntent.status}`,
      });
    }

    // Find transaction
    const transaction = await Transaction.findOne({
      stripePaymentIntentId: paymentIntentId,
      user: req.user._id,
      type: "deposit",
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status === "completed") {
      return res.json({
        message: "Payment already processed",
        walletBalance: (await User.findById(req.user._id)).walletBalance,
      });
    }

    // Update transaction
    transaction.status = "completed";
    // Store payment method ID (can be string or object)
    transaction.stripePaymentId =
      typeof paymentIntent.payment_method === "string"
        ? paymentIntent.payment_method
        : paymentIntent.payment_method?.id || paymentIntentId;
    await transaction.save();

    // Update user wallet using atomic update to avoid triggering document validation
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: transaction.amount, totalDeposits: transaction.amount } },
      { new: true }
    );

    res.json({
      message: "Deposit successful",
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    console.error("Confirm deposit error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Request withdrawal
router.post("/withdraw", auth, async (req, res) => {
  try {
    const {
      amount,
      withdrawalMethod,
      // Bank details
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      // UPI details
      upiId,
      // Wallet details
      walletType,
      walletNumber,
    } = req.body;

    // Validate amount
    if (!amount || amount < 110 || amount > 50000) {
      return res.status(400).json({
        message: "Withdrawal amount must be between ₹110 and ₹50,000",
      });
    }

    // Validate withdrawal method
    if (!withdrawalMethod || !["bank", "upi", "wallet"].includes(withdrawalMethod)) {
      return res.status(400).json({
        message: "Invalid withdrawal method. Must be 'bank', 'upi', or 'wallet'",
      });
    }

    // Validate method-specific fields
    if (withdrawalMethod === "bank") {
      if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
        return res.status(400).json({
          message: "Bank details are required: accountHolderName, accountNumber, ifscCode, bankName",
        });
      }
    } else if (withdrawalMethod === "upi") {
      if (!upiId) {
        return res.status(400).json({
          message: "UPI ID is required",
        });
      }
    } else if (withdrawalMethod === "wallet") {
      if (!walletType || !walletNumber) {
        return res.status(400).json({
          message: "Wallet type and wallet number are required",
        });
      }
    }

    // Atomically deduct from wallet if sufficient balance
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id, walletBalance: { $gte: amount } },
      { $inc: { walletBalance: -amount } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Calculate minimum bet amount required (10% of withdrawal amount, minimum ₹100)
    const minBetAmount = Math.max(100, Math.ceil(amount * 0.1));

    // Create withdrawal transaction with details
    const transaction = await Transaction.create({
      user: req.user._id,
      type: "withdrawal",
      amount,
      status: "pending",
      description: `Withdrawal request of ₹${amount} via ${withdrawalMethod}`,
      withdrawalDetails: {
        paymentMethod: withdrawalMethod,
        accountHolderName: withdrawalMethod === "bank" ? accountHolderName : null,
        accountNumber: withdrawalMethod === "bank" ? accountNumber : null,
        ifscCode: withdrawalMethod === "bank" ? ifscCode : null,
        bankName: withdrawalMethod === "bank" ? bankName : null,
        upiId: withdrawalMethod === "upi" ? upiId : null,
        walletType: withdrawalMethod === "wallet" ? walletType : null,
        walletNumber: withdrawalMethod === "wallet" ? walletNumber : null,
      },
    });

    // Create withdrawal details record for admin tracking
    const withdrawal = await Withdrawal.create({
      user: req.user._id,
      transaction: transaction._id,
      amount,
      withdrawalMethod,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      upiId,
      walletType,
      walletNumber,
      status: "pending",
      minBetAmount,
      commissionStatus: "pending",
    });

    res.json({
      message: "Withdrawal request submitted. Waiting for admin approval.",
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
      },
      withdrawal: {
        id: withdrawal._id,
        withdrawalMethod: withdrawal.withdrawalMethod,
      },
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get user transactions
router.get("/transactions", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
