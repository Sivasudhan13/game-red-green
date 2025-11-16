# Stripe Payment Setup Guide

## Quick Setup

### 1. Get Stripe API Keys

1. Sign up at https://stripe.com
2. Go to Dashboard → Developers → API keys
3. Copy your **Test mode** keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### 2. Configure Backend

Add to `backend/.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

### 3. Configure Frontend

Add to `frontend/.env`:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### 4. Test Payment Flow

**Test Card Numbers:**
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

**Test Details:**
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### 5. Payment Flow

1. User enters deposit amount
2. System creates Stripe Payment Intent
3. User enters card details
4. Stripe processes payment
5. Backend confirms payment and updates wallet

### 6. Production Setup

When ready for production:

1. Switch to **Live mode** in Stripe Dashboard
2. Get **Live mode** keys:
   - `pk_live_...` (Publishable key)
   - `sk_live_...` (Secret key)
3. Update `.env` files with live keys
4. Test with real cards (small amounts first)

## Troubleshooting

### Payment Intent Creation Fails
- Check `STRIPE_SECRET_KEY` is set correctly
- Verify key starts with `sk_test_` (test) or `sk_live_` (production)
- Check Stripe dashboard for API errors

### Payment Confirmation Fails
- Verify payment intent status is `succeeded`
- Check backend logs for errors
- Ensure transaction exists in database

### Frontend Stripe Not Loading
- Check `REACT_APP_STRIPE_PUBLISHABLE_KEY` is set
- Verify key starts with `pk_test_` or `pk_live_`
- Check browser console for errors

## Security Notes

- **Never** commit `.env` files to git
- **Never** expose secret keys in frontend code
- Use test keys for development
- Switch to live keys only in production
- Monitor Stripe dashboard for suspicious activity



