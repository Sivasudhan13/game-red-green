# Email & SMS Verification Setup Guide

## Current Configuration

Your project has been configured with both **Email** and **SMS** verification capabilities.

### Email Verification (SMTP)
- **Provider**: Brevo (SMTP relay)
- **Configuration**: 
  - `SMTP_HOST`: smtp-relay.brevo.com
  - `SMTP_PORT`: 587
  - `EMAIL_USER`: Your Brevo account email
  - `EMAIL_PASSWORD`: Your Brevo API key
  - `SENDER_EMAIL`: Email that appears in sent messages

**Implementation**: `backend/utils/emailService.js`
- Sends OTP via email during registration
- Beautiful HTML email template with branding
- Fallback support for Gmail and other SMTP services

### SMS Verification (Twilio)
- **Provider**: Twilio
- **Configuration**:
  - `TWILIO_ACCOUNT_SID`: Your Twilio account SID
  - `TWILIO_AUTH_TOKEN`: Your Twilio auth token
  - `TWILIO_PHONE_NUMBER`: Your Twilio phone number
  - `SMS_OTP_ENABLED`: Set to true to enable SMS

**Implementation**: `backend/utils/smsService.js`
- Sends OTP via SMS during registration
- Supports multiple providers: Twilio, AWS SNS
- Automatic phone number normalization for Indian format
- Mock mode for development when credentials aren't available

### Registration Flow
1. User requests OTP via `/auth/send-otp` endpoint
2. OTP is sent via **SMS** (primary)
3. User verifies OTP via `/auth/verify-otp` endpoint
4. User completes registration via `/auth/register` endpoint
5. OTP verification token is validated (must be within 30 minutes)

## Security Best Practices Implemented

✅ **Environment Variables**: All secrets stored in `.env` file (not committed to Git)
✅ **Gitignore**: `.env` is properly ignored in `.gitignore`
✅ **.env.example**: Template provided for new developers
✅ **OTP Expiration**: OTPs expire after 10 minutes
✅ **Attempt Limiting**: Maximum 5 failed OTP attempts
✅ **Phone Validation**: Validates 10-digit Indian phone numbers
✅ **Mock Mode**: Development mode logs OTPs to console if SMS service unavailable

## Setup Instructions

### For Production

1. **Rotate Your Credentials** (IMPORTANT!)
   - Since credentials were exposed in `.env`, you must:
   - Go to your Twilio dashboard and regenerate your auth token
   - Generate a new Brevo API key
   - Update the `.env` file with new credentials

2. **Configure Email**
   - Sign up at [Brevo](https://www.brevo.com) (formerly Sendinblue)
   - Get your SMTP credentials
   - Or use Gmail with [app-specific password](https://myaccount.google.com/apppasswords)

3. **Configure SMS**
   - Sign up at [Twilio](https://www.twilio.com)
   - Get your Account SID, Auth Token, and Phone Number
   - Update `.env` with these credentials

4. **Update .env**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

### For Development

- Leave SMS/Email credentials blank or use mock mode
- OTPs will be logged to console
- Verification still works for testing registration flow

## Testing Email & SMS

### Test Email Verification
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210"}'
```

### Test SMS Verification
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210", "otp": "123456"}'
```

## Files Modified

- ✅ `backend/.env` - Updated SMTP variables
- ✅ `backend/.env.example` - Created template
- ✅ `backend/utils/emailService.js` - Email service implementation
- ✅ `backend/utils/smsService.js` - SMS service implementation
- ✅ `backend/routes/auth.js` - Authentication with OTP verification
- ✅ `backend/.gitignore` - Already protects `.env`

## Next Steps

1. **Rotate Exposed Credentials**: Regenerate Twilio and Brevo keys immediately
2. **Add to .env**: Update with new actual credentials
3. **Test**: Verify email and SMS delivery in development
4. **Deploy**: Set environment variables on production server
5. **Monitor**: Check logs for any email/SMS delivery issues
