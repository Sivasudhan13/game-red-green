const mongoose = require("mongoose");
const User = require("../models/User");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/game-bet"
    );

    const email = process.argv[2] || "sivasudhan87@gmail.com";
    const newPassword = process.argv[3] || "908090@Thala";

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`User with email ${email} not found.`);
      console.log("Please register this account first.");
      process.exit(1);
    }

    // Hash new password and update directly to avoid triggering full-document validation
    const hashed = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashed },
      { new: true }
    );

    // Verify password works
    const isMatch = await updatedUser.comparePassword(newPassword);

    console.log("Password reset successful!");
    console.log({
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      passwordVerified: isMatch,
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

resetPassword();




