const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Game = require("../models/Game");
const Bet = require("../models/Bet");
const Withdrawal = require("../models/Withdrawal");

// Get all pending withdrawals
router.get("/withdrawals", auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ["pending", "processing"] };
    }

    const withdrawals = await Withdrawal.find(query)
      .populate("user", "name email")
      .populate("transaction", "amount status description createdAt")
      .populate("processedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ withdrawals });
  } catch (error) {
    console.error("Get withdrawals error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Approve withdrawal
router.post("/approve-withdrawal/:id", auth, adminAuth, async (req, res) => {
  try {
    const { adminNotes } = req.body;

    const withdrawal = await Withdrawal.findById(req.params.id).populate(
      "user transaction"
    );

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending" && withdrawal.status !== "processing") {
      return res.status(400).json({ message: "Withdrawal already processed" });
    }

    // Update withdrawal status
    withdrawal.status = "completed";
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = req.user._id;
    if (adminNotes) {
      withdrawal.adminNotes = adminNotes;
    }
    await withdrawal.save();

    // Update transaction status
    const transaction = withdrawal.transaction;
    if (transaction) {
      transaction.status = "completed";
      await transaction.save();
    }

    // Update user statistics
    const user = await User.findById(withdrawal.user._id);
    user.totalWithdrawals += withdrawal.amount;
    await user.save();

    // Note: The amount was already deducted from wallet when withdrawal was requested
    // When approved, the user receives the amount in their account based on withdrawal details
    // Admin should process the actual transfer using the withdrawal details provided

    // Note: In a real application, you would integrate with a payment gateway
    // (like Stripe Connect, RazorpayX, or bank API) to transfer funds here
    // For now, we mark it as completed and the admin should process it manually
    // The withdrawal details are available in withdrawal object for manual processing

    res.json({
      message:
        "Withdrawal approved successfully. Amount should be transferred to user's account.",
      withdrawal: await Withdrawal.findById(withdrawal._id)
        .populate("user", "name email")
        .populate("transaction", "amount status description")
        .populate("processedBy", "name email"),
    });
  } catch (error) {
    console.error("Approve withdrawal error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Reject withdrawal
router.post("/reject-withdrawal/:id", auth, adminAuth, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id)
      .populate("user")
      .populate("transaction");

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending" && withdrawal.status !== "processing") {
      return res.status(400).json({ message: "Withdrawal already processed" });
    }

    // Update withdrawal status
    withdrawal.status = "rejected";
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = req.user._id;
    if (adminNotes) {
      withdrawal.adminNotes = adminNotes;
    }
    await withdrawal.save();

    // Update transaction status
    const transaction = withdrawal.transaction;
    if (transaction) {
      transaction.status = "cancelled";
      await transaction.save();
    }

    // Refund amount to user
    const user = await User.findById(withdrawal.user._id);
    user.walletBalance += withdrawal.amount;
    await user.save();

    // Populate the updated withdrawal
    const updatedWithdrawal = await Withdrawal.findById(withdrawal._id)
      .populate("user", "name email")
      .populate("transaction")
      .populate("processedBy", "name");

    res.json({
      message: "Withdrawal rejected and amount refunded",
      withdrawal: updatedWithdrawal,
    });
  } catch (error) {
    console.error("Reject withdrawal error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Mark withdrawal as processing
router.post("/process-withdrawal/:id", auth, adminAuth, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Withdrawal already processed" });
    }

    withdrawal.status = "processing";
    await withdrawal.save();

    const updatedWithdrawal = await Withdrawal.findById(withdrawal._id)
      .populate("user", "name email")
      .populate("transaction")
      .populate("processedBy", "name");

    res.json({
      message: "Withdrawal marked as processing",
      withdrawal: updatedWithdrawal,
    });
  } catch (error) {
    console.error("Process withdrawal error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all withdrawals (all statuses)
router.get("/withdrawals/all", auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    const withdrawals = await Withdrawal.find(query)
      .populate("user", "name email")
      .populate("transaction")
      .populate("processedBy", "name")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ withdrawals });
  } catch (error) {
    console.error("Get all withdrawals error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get dashboard stats
router.get("/stats", auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalDeposits = await Transaction.aggregate([
      { $match: { type: "deposit", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalWithdrawals = await Transaction.aggregate([
      { $match: { type: "withdrawal", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalGames = await Game.countDocuments({ status: "completed" });
    const totalBets = await Bet.countDocuments();
    const totalCommission = await Game.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$adminCommission" } } },
    ]);

    res.json({
      totalUsers,
      totalDeposits: totalDeposits[0]?.total || 0,
      totalWithdrawals: totalWithdrawals[0]?.total || 0,
      totalGames,
      totalBets,
      totalCommission: totalCommission[0]?.total || 0,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all users
router.get("/users", auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
