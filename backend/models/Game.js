const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    gameId: {
      type: String,
      required: true,
      unique: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "live", "completed"],
      default: "pending",
    },
    winningColor: {
      type: String,
      enum: ["red", "green", "violet"],
      default: null,
    },
    winningNumber: {
      type: Number,
      min: 0,
      max: 9,
      default: null,
    },
    totalBets: {
      red: { type: Number, default: 0 },
      green: { type: Number, default: 0 },
      violet: { type: Number, default: 0 },
    },
    totalAmount: {
      red: { type: Number, default: 0 },
      green: { type: Number, default: 0 },
      violet: { type: Number, default: 0 },
    },
    adminCommission: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Game", gameSchema);



