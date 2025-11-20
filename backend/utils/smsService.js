// SMS Service
require("dotenv").config();

// Normalize phone number to Indian format
const normalizePhoneNumber = (phoneNumber = "") => {
  if (typeof phoneNumber !== "string") phoneNumber = String(phoneNumber || "");
  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+91")) return cleaned;
  if (cleaned.startsWith("91") && cleaned.length === 12) return "+" + cleaned;
  if (cleaned.length === 10) return "+91" + cleaned;

  return cleaned;
};

// Send OTP via Twilio (or mock in development)
// Signature kept as sendOTPSMS(phoneNumber, otp) to match existing callers
const sendOTPSMS = async (phoneNumber, otp) => {
  try {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Basic validation
    if (!normalizedPhone) {
      throw new Error("Invalid phone number");
    }

    const hasTwilioConfig =
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER;

    if (!hasTwilioConfig) {
      // In non-production environments, return mock OTP
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "⚠️  SMS service not configured. Mock OTP for",
          normalizedPhone,
          ":",
          otp
        );
        console.log(
          "💡 To enable real SMS, configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER in .env"
        );
        return { success: true, mock: true, otp };
      }
      throw new Error(
        "Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env"
      );
    }

    // Lazy-require twilio to avoid crash when package not installed
    let twilio;
    try {
      twilio = require("twilio");
    } catch (e) {
      throw new Error("Twilio package not installed. Run: npm install twilio");
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const body = `Your Win Go verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;

    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: normalizedPhone,
    });

    console.log("✅ SMS sent via Twilio:", message.sid);
    return { success: true, provider: "twilio", messageId: message.sid };
  } catch (error) {
    console.error("Send OTPSMS error:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  normalizePhoneNumber,
  sendOTPSMS,
};
