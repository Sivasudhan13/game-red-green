const Game = require("../models/Game");
const Bet = require("../models/Bet");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Withdrawal = require("../models/Withdrawal");
const crypto = require("crypto");
const mongoose = require("mongoose");

const processGameResult = async () => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB not connected, skipping game processing");
      return;
    }

    const game = await Game.findOne({ status: "live" }).sort({ createdAt: -1 });

    if (!game) {
      // Create a new game if none exists
      const now = new Date();
      const endTime = new Date(now.getTime() + 60 * 1000);
      const gameId = `G${Date.now()}${crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase()}`;

      const newGame = new Game({
        gameId,
        startTime: now,
        endTime,
        status: "live",
      });
      await newGame.save();
      return;
    }

    const now = new Date();
    if (now < game.endTime) {
      return; // Game still running
    }

    // Game engine logic: Color with highest payout loses, lowest payout wins
    const amounts = {
      red: game.totalAmount.red,
      green: game.totalAmount.green,
      violet: game.totalAmount.violet,
    };

    // Find color with lowest amount (wins) and highest amount (loses)
    const sortedColors = Object.entries(amounts).sort((a, b) => a[1] - b[1]);
    const winningColor = sortedColors[0][0]; // Lowest amount wins
    const losingColors = sortedColors.slice(1).map((item) => item[0]);

    // Generate random winning number (0-9)
    const winningNumber = Math.floor(Math.random() * 10);

    // Update game
    game.winningColor = winningColor;
    game.winningNumber = winningNumber;
    game.status = "completed";

    // Calculate admin commission (1-10rs based on total bet amount)
    const totalBetAmount = amounts.red + amounts.green + amounts.violet;
    const commissionRate = Math.min(
      10,
      Math.max(1, Math.floor(totalBetAmount / 1000))
    );
    game.adminCommission = commissionRate;
    await game.save();

    // Process all bets
    const bets = await Bet.find({ game: game._id, status: "pending" });

    for (const bet of bets) {
      const user = await User.findById(bet.user);

      if (bet.color === winningColor) {
        // User wins - double the amount
        const winAmount = bet.amount * 2;
        user.walletBalance += winAmount;
        user.totalWinnings += winAmount;
        bet.status = "won";
        bet.winAmount = winAmount;
        bet.payout = winAmount;

        await Transaction.create({
          user: user._id,
          type: "win",
          amount: winAmount,
          status: "completed",
          description: `Won bet on ${bet.color}`,
        });
      } else {
        // User loses
        bet.status = "lost";
        bet.winAmount = 0;
        bet.payout = 0;
      }

      await bet.save();
      await user.save();
    }

    // Update commission for pending withdrawals based on bets
    // Find all pending withdrawals that need commission
    const pendingWithdrawals = await Withdrawal.find({
      commissionStatus: "pending",
      status: { $in: ["pending", "processing", "approved", "completed"] },
    }).populate("user");

    for (const withdrawal of pendingWithdrawals) {
      // Get total bets made by this user since withdrawal was created
      // Include bets from current game that were just processed
      const userBets = await Bet.find({
        user: withdrawal.user._id,
        createdAt: { $gte: withdrawal.createdAt },
        status: { $in: ["won", "lost", "pending"] }, // Include pending bets from current game
      });

      const totalBetAmount = userBets.reduce((sum, bet) => sum + bet.amount, 0);

      // If user has met minimum bet requirement, calculate commission
      if (totalBetAmount >= withdrawal.minBetAmount && withdrawal.commissionStatus === "pending") {
        // Calculate commission (5% of the minimum bet amount)
        const commissionAmount = withdrawal.minBetAmount * 0.05;
        
        withdrawal.commissionEarned = commissionAmount;
        withdrawal.commissionStatus = "completed";
        await withdrawal.save();
      }
    }

    console.log(
      `Game ${game.gameId} processed. Winner: ${winningColor}, Number: ${winningNumber}`
    );

    // Create new game for next round
    const nextEndTime = new Date(now.getTime() + 60 * 1000);
    const nextGameId = `G${Date.now()}${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    const nextGame = new Game({
      gameId: nextGameId,
      startTime: now,
      endTime: nextEndTime,
      status: "live",
    });
    await nextGame.save();
    console.log(`New game ${nextGameId} created`);
  } catch (error) {
    console.error("Error processing game result:", error);
  }
};

// Start the game processor only after MongoDB is connected
const startGameProcessor = () => {
  // Run every 10 seconds to check for completed games
  setInterval(processGameResult, 10000);
  console.log("Game processor started");
};

// Only start if MongoDB is already connected, otherwise wait for connection event
if (mongoose.connection.readyState === 1) {
  startGameProcessor();
} else {
  mongoose.connection.once("connected", () => {
    startGameProcessor();
  });
}

module.exports = { processGameResult, startGameProcessor };
