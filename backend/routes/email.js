const express = require("express");
const router = express.Router();
const { sendOTPEmail, createTransporter } = require("../utils/emailService");

// Test email configuration
router.get("/test", async (req, res) => {
  try {
    // Check if email is configured
    const hasEmailConfig = 
      (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) ||
      (process.env.SMTP_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

    if (!hasEmailConfig) {
      return res.status(400).json({
        configured: false,
        message: "Email service not configured",
        required: {
          EMAIL_USER: process.env.EMAIL_USER ? "✅ Set" : "❌ Missing",
          EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "✅ Set" : "❌ Missing",
          SMTP_HOST: process.env.SMTP_HOST || "Not set (using service-based config)",
          EMAIL_SERVICE: process.env.EMAIL_SERVICE || "Not set (defaulting to gmail)",
        },
      });
    }

    // Try to create transporter and verify connection
    try {
      const transporter = createTransporter();
      await transporter.verify();
      
      return res.json({
        configured: true,
        message: "Email service is configured and working!",
        config: {
          EMAIL_USER: process.env.EMAIL_USER ? "✅ Set" : "❌ Missing",
          EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "✅ Set (hidden)" : "❌ Missing",
          SMTP_HOST: process.env.SMTP_HOST || "Using service-based config",
          SMTP_PORT: process.env.SMTP_PORT || "Default (587)",
          EMAIL_SERVICE: process.env.EMAIL_SERVICE || "gmail (default)",
        },
      });
    } catch (verifyError) {
      return res.status(500).json({
        configured: true,
        message: "Email service configured but connection failed",
        error: verifyError.message,
        config: {
          EMAIL_USER: process.env.EMAIL_USER,
          SMTP_HOST: process.env.SMTP_HOST || "Service-based",
          EMAIL_SERVICE: process.env.EMAIL_SERVICE || "gmail",
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      configured: false,
      message: "Error checking email configuration",
      error: error.message,
    });
  }
});

// Send test email
router.post("/test-send", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email address is required" });
    }

    const testOTP = "123456";
    await sendOTPEmail(email, testOTP);

    res.json({
      message: "Test email sent successfully!",
      email: email,
      testOTP: testOTP,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send test email",
      error: error.message,
    });
  }
});

module.exports = router;


