# 📧 Email OTP Setup Guide

## Overview

The registration system now requires email OTP (One-Time Password) verification. Users must verify their email address before completing registration.

## 🔧 Email Service Configuration

The email service automatically detects your configuration from `.env` file. It supports multiple configurations:

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Step Verification** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "OK.Win" as the name
   - Copy the 16-character password

3. **Add to `backend/.env`**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   ```
   Or explicitly specify:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   ```

### Option 2: SMTP (For Production)

For production, use a dedicated email service like:
- SendGrid
- Mailgun
- AWS SES
- Custom SMTP server

**Add to `backend/.env`**:
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASSWORD=your-password
SMTP_SECURE=false  # true for port 465, false for 587
```

### Option 3: Other Email Services

For Outlook, Yahoo, etc.:
```env
EMAIL_SERVICE=outlook  # or yahoo, etc.
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Option 4: Development Mode (No Email Setup)

If email is not configured, the system will:
- Generate a mock OTP
- Display it in the console (backend)
- Show it in the frontend (development mode only)
- Still save OTP to database for verification

**For development, you can skip email setup and use mock OTPs.**

---

## 📋 Environment Variables

Add these to your `backend/.env` file:

```env
# Email Configuration (Optional - will use mock mode if not set)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Or for SMTP:
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# EMAIL_USER=your-email@example.com
# EMAIL_PASSWORD=your-password
```

---

## 🔄 Registration Flow

1. **User enters email** → Clicks "Send OTP"
2. **OTP sent to email** (or shown in console for development)
3. **User enters OTP** → Clicks "Verify"
4. **Email verified** → Green checkmark appears
5. **User completes form** → Name, Password, Invite Code (optional)
6. **Registration complete** → User is logged in automatically

---

## 🧪 Testing

### Test Email Configuration

You can test your email configuration using the test endpoint:

```bash
# Test email configuration
curl http://localhost:5000/api/email/test

# Send test email
curl -X POST http://localhost:5000/api/email/test-send \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

### With Email Configured:
1. Enter email address
2. Click "Send OTP"
3. Check your email inbox
4. Enter the 6-digit OTP
5. Complete registration

### Without Email (Development):
1. Enter email address
2. Click "Send OTP"
3. Check backend console for mock OTP
4. Or check frontend - OTP will be displayed
5. Enter the mock OTP
6. Complete registration

---

## 🔒 Security Features

- ✅ OTP expires in 10 minutes
- ✅ Maximum 5 verification attempts
- ✅ OTP can only be used once
- ✅ Email must be verified before registration
- ✅ Verified OTP valid for 30 minutes
- ✅ Auto-cleanup of expired OTPs

---

## 📝 API Endpoints

### Send OTP
```
POST /api/auth/send-otp
Body: { "email": "user@example.com" }
Response: { "message": "OTP sent successfully" }
```

### Verify OTP
```
POST /api/auth/verify-otp
Body: { "email": "user@example.com", "otp": "123456" }
Response: { "message": "OTP verified successfully", "verified": true }
```

### Register (Requires Verified OTP)
```
POST /api/auth/register
Body: {
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "inviteCode": "ABC123", // optional
  "otp": "123456" // required
}
```

---

## 🐛 Troubleshooting

### "Email service not configured"
- **Solution**: Add `EMAIL_USER` and `EMAIL_PASSWORD` to `.env`
- **Or**: Use development mode (mock OTP will be shown)

### "Failed to send OTP email"
- **Gmail**: Make sure you're using App Password, not regular password
- **SMTP**: Check host, port, and credentials
- **Check**: Email service provider status

### "OTP not found or already used"
- OTP was already verified
- OTP expired (10 minutes)
- Request a new OTP

### "Too many failed attempts"
- Maximum 5 attempts per OTP
- Request a new OTP

---

## 📧 Email Template

The OTP email includes:
- Branded header with OK.Win logo
- Large, easy-to-read OTP code
- Expiration notice (10 minutes)
- Professional styling

---

## ✅ Features

- ✅ 6-digit numeric OTP
- ✅ 10-minute expiration
- ✅ Email verification required
- ✅ Resend OTP functionality
- ✅ Development mode (mock OTP)
- ✅ Auto-cleanup of expired OTPs
- ✅ Rate limiting (5 attempts)
- ✅ Beautiful email template

---

## 🚀 Quick Start

1. **Add email config to `backend/.env`** (optional for development)
2. **Restart backend server**
3. **Test registration flow**
4. **Check email inbox** (or console for mock OTP)

That's it! Email OTP verification is now active! 🎉

