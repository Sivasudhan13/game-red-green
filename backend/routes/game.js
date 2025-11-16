const express = require("express");
const router = express.Router();
const Game = require("../models/Game");
const Bet = require("../models/Bet");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { auth } = require("../middleware/auth");
const crypto = require("crypto");

// Get current game (public endpoint - no auth required)
router.get("/current", async (req, res) => {
  try {
    // Check if MongoDB is connected
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
      // Return a default game structure when database is disconnected
      const now = new Date();
      const endTime = new Date(now.getTime() + 60 * 1000);
      const timeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
      
      return res.json({
        game: {
          id: "default",
          gameId: "CONNECTING",
          status: "live",
          timeRemaining,
          startTime: now,
          endTime: endTime,
          winningColor: null,
          winningNumber: null,
          totalBets: { red: 0, green: 0, violet: 0 },
          totalAmount: { red: 0, green: 0, violet: 0 },
        },
        databaseConnected: false,
        message: "Database connection error. Game display only. Please check database connection.",
      });
    }

    let game = await Game.findOne({
      status: { $in: ["pending", "live"] },
    }).sort({ createdAt: -1 });

    if (!game || game.status === "completed") {
      // Create new game
      const now = new Date();
      const endTime = new Date(now.getTime() + 60 * 1000); // 1 minute from now

      const gameId = `G${Date.now()}${crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase()}`;

      game = new Game({
        gameId,
        startTime: now,
        endTime,
        status: "live",
      });
      await game.save();
    }

    // Calculate time remaining
    const now = new Date();
    const timeRemaining = Math.max(0, Math.floor((game.endTime - now) / 1000));

    res.json({
      game: {
        id: game._id,
        gameId: game.gameId,
        status: game.status,
        timeRemaining,
        startTime: game.startTime,
        endTime: game.endTime,
        winningColor: game.winningColor,
        winningNumber: game.winningNumber,
        totalBets: game.totalBets,
        totalAmount: game.totalAmount,
      },
      databaseConnected: true,
    });
  } catch (error) {
    console.error("Get current game error:", error);
    
    // Return a fallback game structure on error
    const now = new Date();
    const endTime = new Date(now.getTime() + 60 * 1000);
    const timeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
    
    res.status(200).json({
      game: {
        id: "error",
        gameId: "ERROR",
        status: "live",
        timeRemaining,
        startTime: now,
        endTime: endTime,
        winningColor: null,
        winningNumber: null,
        totalBets: { red: 0, green: 0, violet: 0 },
        totalAmount: { red: 0, green: 0, violet: 0 },
      },
      databaseConnected: false,
      error: error.message,
    });
  }
});

// Place bet
router.post("/bet", auth, async (req, res) => {
  try {
    const { color, amount } = req.body;

    if (!["red", "green", "violet"].includes(color)) {
      return res.status(400).json({ message: "Invalid color" });
    }

    if (!amount || amount < 1) {
      return res.status(400).json({ message: "Invalid bet amount" });
    }

    const user = await User.findById(req.user._id);
    if (user.walletBalance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Get current game
    let game = await Game.findOne({
      status: { $in: ["pending", "live"] },
    }).sort({ createdAt: -1 });

    if (!game) {
      return res.status(400).json({ message: "No active game found" });
    }

    // Check if game is still accepting bets (30 seconds before end)
    const now = new Date();
    const timeRemaining = (game.endTime - now) / 1000;
    if (timeRemaining < 30) {
      return res.status(400).json({ message: "Betting closed for this round" });
    }

    // Check if user already placed a bet in this game
    const existingBet = await Bet.findOne({ user: user._id, game: game._id });
    if (existingBet) {
      return res
        .status(400)
        .json({ message: "You have already placed a bet in this game" });
    }

    // Deduct amount from wallet
    user.walletBalance -= amount;
    await user.save();

    // Create bet
    const bet = new Bet({
      user: user._id,
      game: game._id,
      color,
      amount,
      status: "pending",
    });
    await bet.save();

    // Update game totals
    game.totalBets[color] += 1;
    game.totalAmount[color] += amount;
    await game.save();

    // Create transaction
    await Transaction.create({
      user: user._id,
      type: "bet",
      amount: -amount,
      status: "completed",
      description: `Bet placed on ${color}`,
    });

    res.json({
      message: "Bet placed successfully",
      bet: {
        id: bet._id,
        color: bet.color,
        amount: bet.amount,
        gameId: game.gameId,
      },
    });
  } catch (error) {
    console.error("Place bet error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get game history (public endpoint - no auth required)
router.get("/history", async (req, res) => {
  try {
    // Check if MongoDB is connected
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
      // Return empty array when database is disconnected
      return res.json({ games: [], databaseConnected: false });
    }

    const limit = parseInt(req.query.limit) || 50;
    const games = await Game.find({ status: "completed" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("gameId winningColor winningNumber totalAmount createdAt");

    res.json({ games, databaseConnected: true });
  } catch (error) {
    console.error("Get history error:", error);
    // Return empty array on error instead of error response
    res.json({ games: [], databaseConnected: false, error: error.message });
  }
});

// Get user bets
router.get("/my-bets", auth, async (req, res) => {
  try {
    const bets = await Bet.find({ user: req.user._id })
      .populate("game", "gameId winningColor winningNumber endTime")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ bets });
  } catch (error) {
    console.error("Get my bets error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get recent bet result for notifications
router.get("/recent-result", auth, async (req, res) => {
  try {
    // Get user's most recent bet that was just processed
    const bet = await Bet.findOne({
      user: req.user._id,
      status: { $in: ["won", "lost"] },
    })
      .populate("game", "gameId winningColor winningNumber status")
      .sort({ updatedAt: -1 });

    if (!bet) {
      return res.json({ hasResult: false });
    }

    // Check if this result was already notified (within last 5 seconds)
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    if (bet.updatedAt < fiveSecondsAgo) {
      return res.json({ hasResult: false });
    }

    res.json({
      hasResult: true,
      bet: {
        id: bet._id,
        color: bet.color,
        amount: bet.amount,
        status: bet.status,
        winAmount: bet.winAmount,
        payout: bet.payout,
        game: {
          gameId: bet.game.gameId,
          winningColor: bet.game.winningColor,
          winningNumber: bet.game.winningNumber,
        },
      },
    });
  } catch (error) {
    console.error("Get recent result error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Process game results (called by cron job or manually)
router.post("/process-result", auth, async (req, res) => {
  try {
    // Only admin can process results
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const game = await Game.findOne({ status: "live" }).sort({ createdAt: -1 });
    if (!game) {
      return res.status(400).json({ message: "No live game found" });
    }

    const now = new Date();
    if (now < game.endTime) {
      return res.status(400).json({ message: "Game is still running" });
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

    // Calculate admin commission (1-10rs based on total bet amount)
    const totalBetAmount = amounts.red + amounts.green + amounts.violet;
    const commissionRate = Math.min(
      10,
      Math.max(1, Math.floor(totalBetAmount / 1000))
    );
    game.adminCommission = commissionRate;
    await game.save();

    // Update commission for pending withdrawals based on bets
    const Withdrawal = require("../models/Withdrawal");
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

    res.json({
      message: "Game result processed",
      game: {
        winningColor,
        winningNumber,
        totalBets: game.totalBets,
        totalAmount: game.totalAmount,
        adminCommission: game.adminCommission,
      },
    });
  } catch (error) {
    console.error("Process result error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
