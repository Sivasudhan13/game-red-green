const mongoose = require("mongoose");

const betSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
    color: {
      type: String,
      enum: ["red", "green", "violet"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "won", "lost"],
      default: "pending",
    },
    winAmount: {
      type: Number,
      default: 0,
    },
    payout: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bet", betSchema);




