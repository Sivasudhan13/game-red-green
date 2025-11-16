const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    withdrawalMethod: {
      type: String,
      enum: ["bank", "upi", "wallet"],
      required: true,
    },
    // Bank details
    accountHolderName: {
      type: String,
      required: function() {
        return this.withdrawalMethod === "bank";
      },
    },
    accountNumber: {
      type: String,
      required: function() {
        return this.withdrawalMethod === "bank";
      },
    },
    ifscCode: {
      type: String,
      required: function() {
        return this.withdrawalMethod === "bank";
      },
    },
    bankName: {
      type: String,
      required: function() {
        return this.withdrawalMethod === "bank";
      },
    },
    // UPI details
    upiId: {
      type: String,
      required: function() {
        return this.withdrawalMethod === "upi";
      },
    },
    // Wallet details (like Paytm, PhonePe, etc.)
    walletType: {
      type: String,
      enum: ["paytm", "phonepe", "googlepay", "other"],
      required: function() {
        return this.withdrawalMethod === "wallet";
      },
    },
    walletNumber: {
      type: String,
      required: function() {
        return this.withdrawalMethod === "wallet";
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "processing", "completed"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    processedAt: {
      type: Date,
      default: null,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    minBetAmount: {
      type: Number,
      default: 0,
      required: true,
    },
    commissionEarned: {
      type: Number,
      default: 0,
    },
    commissionStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    // Razorpay payout tracking
    razorpayPayoutId: {
      type: String,
      default: null,
    },
    payoutStatus: {
      type: String,
      enum: ["pending", "processing", "queued", "rejected", "failed", "reversed", "completed"],
      default: "pending",
    },
    payoutFailureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Withdrawal", withdrawalSchema);


