const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const User = require("../models/User");
const Withdrawal = require("../models/Withdrawal");
const Transaction = require("../models/Transaction");

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get user withdrawals
router.get("/withdrawals", auth, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id })
      .populate("transaction", "amount status description createdAt")
      .populate("processedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ withdrawals });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get user transactions (including withdrawals)
router.get("/transactions", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    // Get withdrawal details for withdrawal transactions
    const withdrawalIds = transactions
      .filter((t) => t.type === "withdrawal")
      .map((t) => t._id);

    const withdrawals = await Withdrawal.find({
      transaction: { $in: withdrawalIds },
    });

    // Map withdrawals to transactions
    const transactionsWithDetails = transactions.map((transaction) => {
      if (transaction.type === "withdrawal") {
        const withdrawal = withdrawals.find(
          (w) => w.transaction.toString() === transaction._id.toString()
        );
        return {
          ...transaction.toObject(),
          withdrawalDetails: withdrawal || null,
        };
      }
      return transaction.toObject();
    });

    res.json({ transactions: transactionsWithDetails });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
