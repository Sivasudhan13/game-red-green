const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Game = require("../models/Game");
const Bet = require("../models/Bet");
const Withdrawal = require("../models/Withdrawal");
const { initiateWithdrawal, getPayoutStatus, isConfigured: isRazorpayConfigured } = require("../utils/razorpayService");

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

    withdrawal.status = "processing";
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = req.user._id;
    if (adminNotes) {
      withdrawal.adminNotes = adminNotes;
    }

    // Check if Razorpay is configured
    if (isRazorpayConfigured()) {
      console.log(`📤 Processing withdrawal ${withdrawal._id} via Razorpay...`);

      // Prepare payout data
      const payoutData = {
        amount: Math.round(withdrawal.amount * 100), // Convert to paise
        method: withdrawal.withdrawalMethod,
        description: `Withdrawal to ${withdrawal.withdrawalMethod} account`,
        reference_id: withdrawal._id.toString(),
      };

      if (withdrawal.withdrawalMethod === "bank") {
        payoutData.account_number = withdrawal.accountNumber;
        payoutData.ifsc_code = withdrawal.ifscCode;
        payoutData.account_holder_name = withdrawal.accountHolderName;
      } else if (withdrawal.withdrawalMethod === "upi") {
        payoutData.account_number = withdrawal.upiId;
      } else if (withdrawal.withdrawalMethod === "wallet") {
        // Note: Razorpay Payouts API doesn't directly support wallet transfers
        // This would need to be handled via a separate wallet integration
        return res.status(400).json({
          message: "Wallet transfers via Razorpay are not yet supported. Please use bank or UPI.",
        });
      }

      // Initiate payout via Razorpay
      const payoutResult = await initiateWithdrawal(payoutData);

      if (payoutResult.success) {
        withdrawal.razorpayPayoutId = payoutResult.payoutId;
        withdrawal.payoutStatus = payoutResult.status;
        console.log(`✅ Razorpay payout initiated: ${payoutResult.payoutId}`);
      } else {
        // Payout failed - revert wallet balance
        await User.findByIdAndUpdate(withdrawal.user._id, {
          $inc: { walletBalance: withdrawal.amount },
        });
        withdrawal.status = "rejected";
        withdrawal.payoutFailureReason = payoutResult.error || "Payout initiation failed";
        console.error(`❌ Payout failed: ${payoutResult.error}`);
      }
    } else {
      console.warn("⚠️ Razorpay not configured. Marking withdrawal as pending manual processing.");
      withdrawal.payoutStatus = "pending";
    }

    await withdrawal.save();

    // Update transaction status
    const transaction = withdrawal.transaction;
    if (transaction) {
      transaction.status = withdrawal.status === "rejected" ? "cancelled" : "processing";
      await transaction.save();
    }

    // Note: User statistics (totalWithdrawals) is updated only when payout is completed
    // For now, the amount was already deducted from wallet when withdrawal was requested

    const updatedWithdrawal = await Withdrawal.findById(withdrawal._id)
      .populate("user", "name email")
      .populate("transaction", "amount status description")
      .populate("processedBy", "name email");

    if (withdrawal.status === "rejected") {
      return res.status(400).json({
        message: "Withdrawal rejected. Funds have been refunded to user wallet.",
        withdrawal: updatedWithdrawal,
      });
    }

    res.json({
      message: isRazorpayConfigured()
        ? "Withdrawal approved and payout initiated via Razorpay. Status will update automatically."
        : "Withdrawal marked for manual processing.",
      withdrawal: updatedWithdrawal,
      razorpayEnabled: isRazorpayConfigured(),
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

    // Refund amount to user (atomic)
    await User.findByIdAndUpdate(withdrawal.user._id, { $inc: { walletBalance: withdrawal.amount } });

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

// Check Razorpay payout status
router.get("/withdrawal/:id/payout-status", auth, adminAuth, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    if (!withdrawal.razorpayPayoutId) {
      return res.status(400).json({
        message: "No Razorpay payout associated with this withdrawal",
      });
    }

    // Fetch latest status from Razorpay
    const payoutStatus = await getPayoutStatus(withdrawal.razorpayPayoutId);

    if (payoutStatus.success) {
      // Update withdrawal if status has changed
      if (payoutStatus.status !== withdrawal.payoutStatus) {
        withdrawal.payoutStatus = payoutStatus.status;

        // If payout is completed, update user statistics
        if (payoutStatus.status === "completed") {
          withdrawal.status = "completed";
          await User.findByIdAndUpdate(withdrawal.user, {
            $inc: { totalWithdrawals: withdrawal.amount },
          });
        }

        await withdrawal.save();
      }

      return res.json({
        message: "Payout status retrieved",
        withdrawal: {
          id: withdrawal._id,
          amount: withdrawal.amount,
          status: withdrawal.status,
          payoutStatus: payoutStatus.status,
          razorpayPayoutId: withdrawal.razorpayPayoutId,
          failureReason: payoutStatus.failureReason,
        },
      });
    } else {
      return res.status(500).json({
        message: "Failed to fetch payout status",
        error: payoutStatus.error,
      });
    }
  } catch (error) {
    console.error("Check payout status error:", error);
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
