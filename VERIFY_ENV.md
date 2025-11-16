# Environment Variables Verification Guide

## 🔍 How to Verify Your Environment Variables

### Quick Verification

**Backend:**
```bash
cd backend
npm run verify-env
```

**Frontend:**
```bash
cd frontend
node scripts/verifyEnv.js
```

---

## ✅ Required Environment Variables Checklist

### Backend (`backend/.env`)

- [ ] **MONGODB_URI**
  - Format: `mongodb://localhost:27017/game-bet` or `mongodb+srv://...`
  - Status: ✅ Set / ❌ Missing

- [ ] **JWT_SECRET**
  - Format: Random string (minimum 32 characters)
  - Status: ✅ Set / ❌ Missing

- [ ] **STRIPE_SECRET_KEY**
  - Format: Starts with `sk_test_` or `sk_live_`
  - Status: ✅ Set / ❌ Missing

- [ ] **PORT** (Optional)
  - Format: Number (default: 5000)
  - Status: ✅ Set / ⚠️ Using default

### Frontend (`frontend/.env`)

- [ ] **REACT_APP_API_URL**
  - Format: `http://localhost:5000/api` or your API URL
  - Status: ✅ Set / ❌ Missing

- [ ] **REACT_APP_STRIPE_PUBLISHABLE_KEY**
  - Format: Starts with `pk_test_` or `pk_live_`
  - Status: ✅ Set / ❌ Missing

---

## 📋 Manual Verification

### Check Backend Environment Variables

1. **Open `backend/.env` file**
2. **Verify these variables exist:**
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key_min_32_chars
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   PORT=5000
   ```

3. **Check format:**
   - `MONGODB_URI` should start with `mongodb://` or `mongodb+srv://`
   - `JWT_SECRET` should be at least 32 characters long
   - `STRIPE_SECRET_KEY` should start with `sk_test_` or `sk_live_`

### Check Frontend Environment Variables

1. **Open `frontend/.env` file**
2. **Verify these variables exist:**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

3. **Check format:**
   - `REACT_APP_API_URL` should start with `http://` or `https://`
   - `REACT_APP_STRIPE_PUBLISHABLE_KEY` should start with `pk_test_` or `pk_live_`

---

## 🚨 Common Issues

### Issue: "MONGODB_URI is missing"
**Solution:**
- Add `MONGODB_URI=mongodb://localhost:27017/game-bet` to `backend/.env`
- Or use MongoDB Atlas connection string

### Issue: "JWT_SECRET is too short"
**Solution:**
- Generate a longer secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Add to `backend/.env`

### Issue: "STRIPE_SECRET_KEY format invalid"
**Solution:**
- Verify key starts with `sk_test_` (test) or `sk_live_` (live)
- Get from: https://stripe.com → Dashboard → Developers → API keys

### Issue: "REACT_APP_STRIPE_PUBLISHABLE_KEY format invalid"
**Solution:**
- Verify key starts with `pk_test_` (test) or `pk_live_` (live)
- Get from: https://stripe.com → Dashboard → Developers → API keys

### Issue: "Frontend can't read .env file"
**Solution:**
- Make sure file is named exactly `.env` (not `.env.txt`)
- Restart React dev server after adding/updating `.env`
- Variables must start with `REACT_APP_` prefix

---

## ✅ Verification Scripts

### Backend Verification

The verification script checks:
- ✅ All required variables are present
- ✅ Variables have correct format
- ✅ Values are not empty
- ✅ Sensitive keys are properly formatted

**Run:**
```bash
cd backend
npm run verify-env
```

### Frontend Verification

The verification script checks:
- ✅ `.env` file exists
- ✅ All required variables are present
- ✅ Variables have correct format
- ✅ Values are not empty

**Run:**
```bash
cd frontend
node scripts/verifyEnv.js
```

---

## 🔒 Security Notes

1. **Never commit `.env` files to Git**
   - They are already in `.gitignore`
   - Keep them local only

2. **Use different keys for development and production**
   - Test keys for development
   - Live keys for production

3. **Keep secrets secure**
   - Don't share `.env` files
   - Don't expose keys in code or logs

---

## 📝 Example .env Files

### `backend/.env` (Example)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/game-bet
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
STRIPE_SECRET_KEY=REDACTED_STRIPE_TEST_KEY
```

### `frontend/.env` (Example)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdefghijklmnopqrstuvwxyz
```

---

## 🎯 Quick Test

After setting up environment variables:

1. **Verify backend:**
   ```bash
   cd backend
   npm run verify-env
   ```

2. **Verify frontend:**
   ```bash
   cd frontend
   node scripts/verifyEnv.js
   ```

3. **Start application:**
   ```bash
   npm run dev
   ```

4. **Test functionality:**
   - Login works
   - Stripe payment works
   - Database connection works

---

## 📖 Related Documentation

- **API Keys Required**: `API_KEYS_REQUIRED.md`
- **Stripe Setup**: `STRIPE_SETUP.md`
- **General Setup**: `SETUP.md`

---

**✅ If all checks pass, your environment is properly configured!**



