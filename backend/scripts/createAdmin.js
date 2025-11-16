const mongoose = require("mongoose");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/game-bet"
    );

    const email = process.argv[2] || "admin@okwin.com";

    const user = await User.findOne({ email });

    if (user) {
      user.role = "admin";
      await user.save();
      console.log(`User ${email} is now an admin`);
    } else {
      console.log(`User with email ${email} not found. Please register first.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createAdmin();
