require("dotenv").config();
const { sendOTPEmail } = require("../utils/emailService");

const to = process.argv[2] || process.env.TEST_EMAIL_TO;
if (!to) {
  console.error("Usage: node scripts/test-email.js recipient@example.com");
  process.exit(1);
}

(async () => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Sending test OTP to", to);
    await sendOTPEmail(to, otp);
    console.log("Done (check inbox or spam).");
  } catch (err) {
    console.error("Test email failed:", err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    process.exit(2);
  }
})();
