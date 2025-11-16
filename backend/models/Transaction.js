const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "bet", "win", "referral"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    stripePaymentId: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: "",
    },
    // Withdrawal details (for quick access, detailed info in Withdrawal model)
    withdrawalDetails: {
      accountHolderName: {
        type: String,
        default: null,
      },
      accountNumber: {
        type: String,
        default: null,
      },
      ifscCode: {
        type: String,
        default: null,
      },
      bankName: {
        type: String,
        default: null,
      },
      upiId: {
        type: String,
        default: null,
      },
      walletType: {
        type: String,
        default: null,
      },
      walletNumber: {
        type: String,
        default: null,
      },
      paymentMethod: {
        type: String,
        enum: ["bank", "upi", "wallet", null],
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
