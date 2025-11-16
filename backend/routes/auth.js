const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const OTP = require("../models/OTP");
const { auth } = require("../middleware/auth");
const crypto = require("crypto");
const { sendOTPEmail } = require("../utils/emailService");
const { sendOTPSMS, normalizePhoneNumber } = require("../utils/smsService");

// Generate unique invite code
const generateInviteCode = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for registration (via phone number)
router.post("/send-otp", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Validate phone number format (10 digits for Indian numbers)
    if (!/^(\+91)?[6-9]\d{9}$/.test(normalizedPhone.replace(/\s/g, ""))) {
      return res
        .status(400)
        .json({ message: "Please enter a valid 10-digit phone number" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber: normalizedPhone });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this phone number" });
    }

    // Generate OTP
    const otpCode = generateOTP();

    // Delete any existing OTPs for this phone number
    await OTP.deleteMany({ phoneNumber: normalizedPhone });

    // Create new OTP
    const otp = new OTP({
      phoneNumber: normalizedPhone,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    await otp.save();

    // Send OTP via SMS
    try {
      const smsResult = await sendOTPSMS(normalizedPhone, otpCode);

      if (smsResult.mock) {
        // Development mode - return mock OTP
        return res.json({
          message: "OTP sent successfully (mock mode - check console)",
          mockOTP: smsResult.otp,
          phoneNumber: normalizedPhone,
        });
      }

      res.json({
        message: "OTP sent successfully to your phone number",
        phoneNumber: normalizedPhone,
      });
    } catch (smsError) {
      // If SMS fails, still save OTP but log error
      console.error("❌ SMS sending failed:", smsError.message);
      console.error("💡 Check your .env file for TWILIO or AWS SNS settings");

      // In development, return mock OTP even if SMS fails
      if (
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV !== "production"
      ) {
        return res.json({
          message: "OTP generated (SMS service unavailable - check console)",
          mockOTP: otpCode,
          phoneNumber: normalizedPhone,
        });
      }

      res.status(500).json({
        message: "Failed to send OTP SMS. Please check your SMS configuration.",
        error: smsError.message,
        hint: "Check TWILIO or AWS SNS settings in .env file",
      });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res
        .status(400)
        .json({ message: "Phone number and OTP are required" });
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Find OTP
    const otpRecord = await OTP.findOne({
      phoneNumber: normalizedPhone,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found or already used" });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      return res
        .status(400)
        .json({
          message: "Too many failed attempts. Please request a new OTP.",
        });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      await otpRecord.incrementAttempts();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark OTP as verified
    await otpRecord.markAsVerified();

    res.json({
      message: "OTP verified successfully",
      verified: true,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Send OTP for email verification
router.post("/send-email-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Generate OTP
    const otpCode = generateOTP();

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Create new OTP
    const otp = new OTP({
      email: email.toLowerCase(),
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    await otp.save();

    // Send OTP via email
    try {
      await sendOTPEmail(email, otpCode);

      res.json({
        message: "OTP sent successfully to your email",
        email: email.toLowerCase(),
      });
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError.message);

      // In development, return mock OTP even if email fails
      if (
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV !== "production"
      ) {
        return res.json({
          message: "OTP generated (Email service unavailable - check console)",
          mockOTP: otpCode,
          email: email.toLowerCase(),
        });
      }

      res.status(500).json({
        message: "Failed to send OTP email. Please check your email configuration.",
        error: emailError.message,
      });
    }
  } catch (error) {
    console.error("Send email OTP error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Verify email OTP
router.post("/verify-email-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: "Email and OTP are required" });
    }

    // Find OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      verified: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found or already used" });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      return res
        .status(400)
        .json({
          message: "Too many failed attempts. Please request a new OTP.",
        });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      await otpRecord.incrementAttempts();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark OTP as verified
    await otpRecord.markAsVerified();

    res.json({
      message: "Email OTP verified successfully",
      verified: true,
    });
  } catch (error) {
    console.error("Verify email OTP error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, phoneNumber, password, inviteCode, email } = req.body;

    // Validate input
    if (!name || !phoneNumber || !password || !email) {
      return res
        .status(400)
        .json({ message: "Name, phone number, email, and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Validate phone number format
    if (!/^(\+91)?[6-9]\d{9}$/.test(normalizedPhone.replace(/\s/g, ""))) {
      return res
        .status(400)
        .json({ message: "Please enter a valid 10-digit phone number" });
    }

    // Check if user exists with phone number
    const existingUser = await User.findOne({ phoneNumber: normalizedPhone });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this phone number" });
    }

    // Check if email is already used
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res
          .status(400)
          .json({ message: "Email already registered" });
      }
    }

    // Note: email OTP verification not required for registration

    // Generate unique invite code
    let userInviteCode = generateInviteCode();
    while (await User.findOne({ inviteCode: userInviteCode })) {
      userInviteCode = generateInviteCode();
    }

    // Check if referred by someone
    let referredBy = null;
    if (inviteCode) {
      const referrer = await User.findOne({
        inviteCode: inviteCode.toUpperCase(),
      });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    // Create user with phone number and email
    const user = new User({
      name: name.trim(),
      phoneNumber: normalizedPhone,
      email: email ? email.toLowerCase() : null,
      password,
      inviteCode: userInviteCode,
      referredBy,
    });

    await user.save();

    // If referred, add 25rs to referrer
    if (referredBy) {
      // Atomically credit referrer's wallet to avoid document validation issues
      await User.findByIdAndUpdate(referredBy, { $inc: { walletBalance: 25 } });

      // Create referral transaction
      await Transaction.create({
        user: referredBy,
        type: "referral",
        amount: 25,
        status: "completed",
        description: `Referral bonus for ${user.name}`,
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        walletBalance: user.walletBalance,
        inviteCode: user.inviteCode,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password, phoneNumber, email } = req.body;

    // Allow callers to send either `identifier` (email or phone), or `phoneNumber`/`email` explicitly
    let lookup = {};
    if (identifier) {
      if (typeof identifier === 'string' && identifier.includes('@')) {
        lookup.email = identifier.toLowerCase();
      } else {
        lookup.phoneNumber = normalizePhoneNumber(identifier);
      }
    } else if (email) {
      lookup.email = email.toLowerCase();
    } else if (phoneNumber) {
      lookup.phoneNumber = normalizePhoneNumber(phoneNumber);
    }

    if ((!lookup.email && !lookup.phoneNumber) || !password) {
      return res.status(400).json({ message: "Identifier (email or phone) and password are required" });
    }

    // Find user by email or phone
    const user = await User.findOne(lookup);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: "Account is deactivated" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        walletBalance: user.walletBalance,
        inviteCode: user.inviteCode,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        walletBalance: user.walletBalance,
        inviteCode: user.inviteCode,
        role: user.role,
        totalDeposits: user.totalDeposits,
        totalWithdrawals: user.totalWithdrawals,
        totalWinnings: user.totalWinnings,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
