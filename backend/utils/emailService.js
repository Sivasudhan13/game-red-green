const nodemailer = require("nodemailer");

// Create reusable transporter
const createTransporter = () => {
  // Check if SMTP configuration is provided
  if (process.env.SMTP_HOST) {
    // Use SMTP configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure:
        process.env.SMTP_PORT === "465" || process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
      },
    });
    return transporter;
  }

  // Use service-based configuration (Gmail, Outlook, etc.)
  if (process.env.EMAIL_SERVICE) {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE, // gmail, outlook, yahoo, etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    return transporter;
  }

  // Default to Gmail if no service specified but credentials exist
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    return transporter;
  }

  throw new Error(
    "Email configuration not found. Please set EMAIL_USER and EMAIL_PASSWORD, or SMTP configuration."
  );
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Win Go" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Win Go Registration",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Win Go</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">Email Verification</h2>
            <p style="color: #4b5563; font-size: 16px;">
              Thank you for registering with Win Go! Please use the following OTP to verify your email address:
            </p>
            <div style="background: white; border: 2px dashed #ef4444; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="font-size: 32px; font-weight: bold; color: #ef4444; letter-spacing: 8px; margin: 0;">
                ${otp}
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Best regards,<br>
              The Win Go Team
            </p>
          </div>
          <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">This is an automated email. Please do not reply.</p>
          </div>
        </div>
      `,
      text: `
        Win Go - Email Verification
        
        Thank you for registering with Win Go!
        
        Your OTP is: ${otp}
        
        This OTP will expire in 10 minutes.
        
        If you didn't request this, please ignore this email.
        
        Best regards,
        The Win Go Team
      `,
    };

    // Verify connection before sending
    await transporter.verify();
    console.log("✅ Email service connection verified");

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent successfully:", info.messageId);
    console.log("📧 Email sent to:", email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);

    // Provide more specific error messages
    if (error.code === "EAUTH") {
      throw new Error(
        "Email authentication failed. Please check EMAIL_USER and EMAIL_PASSWORD in .env"
      );
    } else if (error.code === "ECONNECTION") {
      throw new Error(
        "Email connection failed. Please check SMTP_HOST and SMTP_PORT in .env"
      );
    } else if (error.message) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
    throw new Error(
      "Failed to send OTP email. Please check your email configuration."
    );
  }
};

module.exports = {
  sendOTPEmail,
  createTransporter,
};
