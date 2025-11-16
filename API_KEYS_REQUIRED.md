# Required API Keys and Environment Variables

This document lists all the API keys and environment variables required to run the application.

## 📋 Required Keys Summary

### Backend Environment Variables (`backend/.env`)

1. **MONGODB_URI** (Required)

   - MongoDB database connection string
   - Format: `mongodb://localhost:27017/game-bet` (local) or MongoDB Atlas connection string
   - Default: `mongodb://localhost:27017/game-bet`

2. **JWT_SECRET** (Required)

   - Secret key for JWT token encryption
   - Should be a long, random string
   - Example: `your-super-secret-jwt-key-change-this-in-production-12345`

3. **STRIPE_SECRET_KEY** (Required for payments)

   - Stripe secret API key
   - Test mode: Starts with `sk_test_`
   - Live mode: Starts with `sk_live_`
   - Get from: https://stripe.com → Dashboard → Developers → API keys

4. **PORT** (Optional)
   - Backend server port
   - Default: `5000`

### Frontend Environment Variables (`frontend/.env`)

1. **REACT_APP_API_URL** (Required)

   - Backend API URL
   - Development: `http://localhost:5000/api`
   - Production: Your production API URL

2. **REACT_APP_STRIPE_PUBLISHABLE_KEY** (Required for payments)
   - Stripe publishable API key
   - Test mode: Starts with `pk_test_`
   - Live mode: Starts with `pk_live_`
   - Get from: https://stripe.com → Dashboard → Developers → API keys

---

## 🔧 Setup Instructions

### Step 1: Create Backend `.env` File

Create `backend/.env`:

```env
# Server Configuration
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/game-bet
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/game-bet

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

### Step 2: Create Frontend `.env` File

Create `frontend/.env`:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000/api

# Stripe Payment Gateway
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

---

## 🔑 How to Get API Keys

### 1. MongoDB Connection String

**Local MongoDB:**

- If MongoDB is installed locally, use: `mongodb://localhost:27017/game-bet`
- No API key needed

**MongoDB Atlas (Cloud):**

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Go to Database Access → Add New Database User
4. Go to Network Access → Add IP Address (0.0.0.0/0 for all)
5. Go to Clusters → Connect → Connect your application
6. Copy the connection string
7. Replace `<password>` with your database user password

### 2. JWT Secret Key

**Generate a secure random string:**

- Use Node.js: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Or use an online generator: https://randomkeygen.com/
- Minimum 32 characters recommended

### 3. Stripe API Keys

**Get Stripe Keys:**

1. Sign up at https://stripe.com (free account)
2. Go to Dashboard → Developers → API keys
3. Make sure you're in **Test mode** (toggle in top right)
4. Copy:
   - **Publishable key** (starts with `pk_test_`) → Use in `frontend/.env`
   - **Secret key** (starts with `sk_test_`) → Use in `backend/.env`

**Test Mode vs Live Mode:**

- **Test Mode**: Use for development (keys start with `pk_test_` and `sk_test_`)
- **Live Mode**: Use for production (keys start with `pk_live_` and `sk_live_`)

---

## ✅ Quick Setup Checklist

- [ ] MongoDB running locally OR MongoDB Atlas connection string
- [ ] Created `backend/.env` with:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET` (random secure string)
  - [ ] `STRIPE_SECRET_KEY` (from Stripe dashboard)
- [ ] Created `frontend/.env` with:
  - [ ] `REACT_APP_API_URL`
  - [ ] `REACT_APP_STRIPE_PUBLISHABLE_KEY` (from Stripe dashboard)
- [ ] Restarted development servers after adding `.env` files

---

## 🧪 Testing Your Setup

### Test MongoDB Connection:

```bash
# Start MongoDB (if local)
mongod

# Or verify MongoDB Atlas connection string is correct
```

### Test Stripe Keys:

1. Use test card: `4242 4242 4242 4242`
2. Any future expiry date (e.g., 12/25)
3. Any CVC (e.g., 123)
4. Try making a deposit

### Test JWT:

- Register a new user
- Login should work
- Token should be generated

---

## 🔒 Security Notes

1. **Never commit `.env` files to Git**

   - They are already in `.gitignore`
   - Keep them local only

2. **Use different keys for development and production**

   - Test keys for development
   - Live keys for production

3. **Keep JWT_SECRET secure**

   - Use a long, random string
   - Don't share it publicly
   - Change it if compromised

4. **Stripe Keys**
   - Publishable key is safe for frontend (public)
   - Secret key must stay in backend only (never expose)

---

## 📝 Example `.env` Files

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

## 🆘 Troubleshooting

**"MongoDB Connection Error"**

- Check MongoDB is running
- Verify `MONGODB_URI` is correct
- Check network access (for Atlas)

**"Stripe publishable key is not configured"**

- Verify `REACT_APP_STRIPE_PUBLISHABLE_KEY` is in `frontend/.env`
- Restart React development server
- Check key starts with `pk_test_` or `pk_live_`

**"Payment gateway not configured"**

- Verify `STRIPE_SECRET_KEY` is in `backend/.env`
- Restart backend server
- Check key starts with `sk_test_` or `sk_live_`

**"JWT token errors"**

- Verify `JWT_SECRET` is set in `backend/.env`
- Use a long, random string (32+ characters)

---

## 📞 Need Help?

- MongoDB: https://docs.mongodb.com/
- Stripe: https://stripe.com/docs
- JWT: https://jwt.io/


