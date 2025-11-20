const mongoose = require("mongoose");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

const checkUser = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/game-bet"
    );

    const email = process.argv[2] || "sivasudhan87@gmail.com";

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      console.log("User found:");
      console.log({
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        hasPassword: !!user.password,
      });
    } else {
      console.log(`User with email ${email} not found.`);
      console.log("Please register this account first at http://localhost:3000/register");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkUser();






