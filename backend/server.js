const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection check middleware
// Only block endpoints that absolutely require database (auth, bets, payments, admin)
app.use((req, res, next) => {
  // Skip health check and public game endpoints
  const publicEndpoints = ["/api/health", "/api/game/current", "/api/game/history"];
  if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    return next();
  }
  
  // Check if MongoDB is connected for protected endpoints
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database connection error",
      error: "MongoDB is not connected. Please check your database connection and IP whitelist settings.",
      help: "If using MongoDB Atlas, make sure your IP address is whitelisted in Network Access settings.",
    });
  }
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/game", require("./routes/game"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/email", require("./routes/email"));
app.use("/api/webhooks", require("./routes/webhooks"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Start game processor
const { startGameProcessor } = require("./utils/gameProcessor");

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/game-bet";

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000,
  retryWrites: true,
};

mongoose
  .connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    // Start game processor after MongoDB connection
    startGameProcessor();
  })
  .catch((error) => {
    console.error("\n❌ MongoDB Connection Error:");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Check if it's an Atlas IP whitelist issue
    if (error.message && error.message.includes("IP") && error.message.includes("whitelist")) {
      console.error("🔒 IP Whitelist Issue Detected!");
      console.error("\n📝 How to Fix:");
      console.error("1. Go to MongoDB Atlas Dashboard: https://cloud.mongodb.com");
      console.error("2. Navigate to: Network Access → IP Access List");
      console.error("3. Click 'Add IP Address'");
      console.error("4. Option A: Add your current IP address");
      console.error("   Option B: Add '0.0.0.0/0' to allow all IPs (⚠️ Development only!)");
      console.error("5. Wait 1-2 minutes for changes to take effect");
      console.error("6. Restart the server");
    } else if (error.message && error.message.includes("authentication")) {
      console.error("🔐 Authentication Error!");
      console.error("Check your MongoDB connection string:");
      console.error("- Verify username and password are correct");
      console.error("- Check if the database user has proper permissions");
    } else if (MONGODB_URI.includes("mongodb+srv://") || MONGODB_URI.includes("atlas")) {
      console.error("🌐 MongoDB Atlas Connection Issue!");
      console.error("\nPossible causes:");
      console.error("1. IP address not whitelisted (most common)");
      console.error("2. Network connectivity issues");
      console.error("3. Cluster might be paused");
      console.error("4. Incorrect connection string");
      console.error("\nCheck your connection string format:");
      console.error("mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority");
    } else {
      console.error("💾 Local MongoDB Connection Issue!");
      console.error("\nPossible causes:");
      console.error("1. MongoDB is not running");
      console.error("2. Wrong connection string");
      console.error("3. Port 27017 is blocked");
      console.error("\nTo start MongoDB locally:");
      console.error("Windows: mongod (or start MongoDB service)");
      console.error("Linux/Mac: sudo systemctl start mongod");
    }
    
    console.error("\n📋 Connection String (first 50 chars):", MONGODB_URI.substring(0, 50) + "...");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("\n⚠️  Server will continue but database operations will fail!");
    console.error("💡 Fix the MongoDB connection and restart the server.\n");
    
    // Don't exit - let server start but log the error
    // This allows the API to respond with helpful error messages
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    message: "Server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
});
