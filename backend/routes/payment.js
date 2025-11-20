const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { auth } = require("../middleware/auth");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Withdrawal = require("../models/Withdrawal");

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

// Create payment intent for deposit
router.post("/deposit", auth, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        message:
          "Payment gateway not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      });
    }

    const { amount } = req.body;

    if (!amount || amount < 70 || amount > 50000) {
      return res.status(400).json({
        message: "Deposit amount must be between ₹70 and ₹50,000",
      });
    }

    const orderAmount = Math.round(amount * 100);

    const order = await razorpay.orders.create({
      amount: orderAmount,
      currency: "INR",
      receipt: `dep_${req.user._id}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        userId: req.user._id.toString(),
        type: "wallet_deposit",
      },
    });

    const transaction = await Transaction.create({
      user: req.user._id,
      type: "deposit",
      amount,
      status: "pending",
      razorpayOrderId: order.id,
      description: `Deposit of ₹${amount}`,
    });

    const sanitizedPhone =
      typeof req.user.phoneNumber === "string"
        ? req.user.phoneNumber.replace(/\D/g, "")
        : "";

    res.json({
      orderId: order.id,
      amount,
      amountInPaise: order.amount,
      currency: order.currency,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      transactionId: transaction._id,
      prefill: {
        name: req.user.name || "",
        email: req.user.email || "",
        phone: sanitizedPhone,
      },
    });
  } catch (error) {
    console.error("Create deposit error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Confirm payment and complete deposit
router.post("/confirm-deposit", auth, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        message: "Payment gateway not configured",
      });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        message: "Razorpay order ID, payment ID, and signature are required",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const transaction = await Transaction.findOne({
      user: req.user._id,
      type: "deposit",
      razorpayOrderId,
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

    transaction.status = "completed";
    transaction.razorpayPaymentId = razorpayPaymentId;
    transaction.razorpaySignature = razorpaySignature;
    await transaction.save();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: {
          walletBalance: transaction.amount,
          totalDeposits: transaction.amount,
        },
      },
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
