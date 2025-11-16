const express = require("express");
const router = express.Router();
const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");
const crypto = require("crypto");

/**
 * Razorpay Webhook Handler
 * This endpoint receives status updates from Razorpay when payouts complete
 * 
 * Setup on Razorpay Dashboard:
 * 1. Go to Settings > Webhooks
 * 2. Add Webhook URL: https://your-domain/api/webhooks/razorpay
 * 3. Select Events: "payout.processed", "payout.failed", "payout.queued", "payout.reversed"
 * 4. Copy Webhook Secret and add to .env as RAZORPAY_WEBHOOK_SECRET
 */
router.post("/razorpay", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("❌ Invalid Razorpay webhook signature");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const event = req.body.event;
    const payout = req.body.payload.payout.entity;

    console.log(`📨 Razorpay webhook received: ${event} - Payout ID: ${payout.id}`);

    // Find withdrawal by Razorpay payout ID
    const withdrawal = await Withdrawal.findOne({
      razorpayPayoutId: payout.id,
    }).populate("user");

    if (!withdrawal) {
      console.log(`⚠️ Withdrawal not found for payout ID: ${payout.id}`);
      return res.status(200).json({ message: "Acknowledged" });
    }

    // Map Razorpay status to our status
    let newStatus = withdrawal.payoutStatus;
    const razorpayStatus = payout.status; // processing, queued, rejected, failed, reversed, transferred

    if (razorpayStatus === "transferred") {
      newStatus = "completed";
    } else if (razorpayStatus === "failed") {
      newStatus = "failed";
      // Refund amount to user if payout failed
      await User.findByIdAndUpdate(withdrawal.user._id, {
        $inc: { walletBalance: withdrawal.amount },
      });
    } else if (razorpayStatus === "rejected") {
      newStatus = "rejected";
      // Refund amount to user if payout rejected
      await User.findByIdAndUpdate(withdrawal.user._id, {
        $inc: { walletBalance: withdrawal.amount },
      });
    } else if (razorpayStatus === "reversed") {
      newStatus = "reversed";
      // Refund amount to user if payout reversed
      await User.findByIdAndUpdate(withdrawal.user._id, {
        $inc: { walletBalance: withdrawal.amount },
      });
    } else {
      newStatus = razorpayStatus;
    }

    // Update withdrawal status
    withdrawal.payoutStatus = newStatus;
    withdrawal.payoutFailureReason = payout.failure_reason || null;

    if (newStatus === "completed") {
      withdrawal.status = "completed";
      // Update user total withdrawals (only count successful payouts)
      await User.findByIdAndUpdate(withdrawal.user._id, {
        $inc: { totalWithdrawals: withdrawal.amount },
      });
    } else if (["failed", "rejected", "reversed"].includes(newStatus)) {
      withdrawal.status = "rejected";
    }

    await withdrawal.save();

    console.log(`✅ Withdrawal updated: ${withdrawal._id} - Status: ${newStatus}`);

    // Send 200 OK to acknowledge receipt
    res.json({ message: "Acknowledged" });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    // Always return 200 to prevent Razorpay from retrying
    res.status(200).json({ message: "Error processed" });
  }
});

module.exports = router;
