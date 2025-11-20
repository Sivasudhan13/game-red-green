# Running Frontend and Backend Separately

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies (if not already installed)
```bash
npm install
```

### 3. Create `.env` File
Copy `.env.example` to `.env` and fill in your configuration:
```bash
cp .env.example .env
```

Required variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` - Razorpay API keys (used for deposits & withdrawals)
- `RAZORPAY_WEBHOOK_SECRET` - Razorpay webhook secret (for payout status callbacks)
- `EMAIL_USER` & `EMAIL_PASSWORD` - Email credentials for OTP sending

### 4. Start Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Backend will run on **http://localhost:5000**

---

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies (if not already installed)
```bash
npm install
```

### 3. Create `.env` File (if needed)
Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start Frontend Server

```bash
npm start
```

Frontend will run on **http://localhost:3000**

---

## Running Both Together

### From Root Directory

**Option 1: Run with concurrently (both in one terminal)**
```bash
npm run dev
```
This runs:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

**Option 2: Run in separate terminals**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
# or npm start for production
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

---

## Scripts Reference

### Root Level Scripts
```bash
npm run dev              # Run both backend (dev) and frontend together
npm run install-all     # Install all dependencies
npm run install-backend # Install backend only
npm run install-frontend # Install frontend only
npm run build           # Build frontend for production
```

### Backend Scripts (from `backend` directory)
```bash
npm run dev             # Start with nodemon (auto-reload)
npm start               # Start production server
npm run create-admin    # Create admin user
npm run check-user      # Check user details
npm run reset-password  # Reset admin password
npm run verify-env      # Verify environment variables
```

### Frontend Scripts (from `frontend` directory)
```bash
npm start               # Start development server
npm run build           # Build for production
npm run test            # Run tests
npm run eject           # Eject from Create React App (not reversible!)
```

---

## Troubleshooting

### Backend won't start on port 5000

**Option 1: Use different port**
```bash
PORT=5001 npm start
```

**Option 2: Kill existing process**
Windows:
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

Linux/Mac:
```bash
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Error

1. Check `MONGODB_URI` in `.env`
2. If using MongoDB Atlas, whitelist your IP:
   - Go to Network Access → IP Access List
   - Click "Add IP Address"
   - Add your current IP or `0.0.0.0/0` (less secure)

### Frontend can't connect to Backend

1. Check backend is running on port 5000
2. Verify `REACT_APP_API_URL` in frontend `.env`
3. Check CORS is enabled in backend

### Port Already in Use

Frontend (port 3000):
```bash
PORT=3001 npm start
```

Backend (port 5000):
```bash
PORT=5001 npm start
```

---

## API Endpoints

Base URL: `http://localhost:5000/api`

### Auth Routes
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/send-email-otp` - Send email OTP
- `POST /auth/verify-email-otp` - Verify email OTP
- `GET /auth/me` - Get current user (requires auth token)

### Game Routes
- `GET /game/current` - Get current game
- `GET /game/history` - Get game history
- `POST /game/bet` - Place a bet (requires auth)
- `GET /game/my-bets` - Get user's bets (requires auth)
- `GET /game/recent-result` - Get recent bet result (requires auth)

### Payment Routes
- `POST /payment/deposit` - Create deposit intent (requires auth)
- `POST /payment/confirm-deposit` - Confirm deposit (requires auth)
- `POST /payment/withdraw` - Request withdrawal (requires auth)
- `GET /payment/transactions` - Get transaction history (requires auth)

### Admin Routes (requires admin auth)
- `GET /admin/withdrawals` - Get pending/processing withdrawals
- `POST /admin/approve-withdrawal/:id` - Approve withdrawal
- `POST /admin/reject-withdrawal/:id` - Reject withdrawal
- `GET /admin/withdrawal/:id/payout-status` - Check Razorpay payout status
- `GET /admin/stats` - Get dashboard statistics

---

## Real Withdrawal Integration

The app now supports **real withdrawals** using **Razorpay Payouts API**.

### Setup Razorpay for Real Withdrawals

1. **Create Razorpay Account**: https://razorpay.com
2. **Get API Keys**:
   - Go to Settings → API Keys
   - Copy Key ID and Key Secret
3. **Add to `.env`**:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxx
   RAZORPAY_WEBHOOK_SECRET=xxxx
   ```
4. **Setup Webhook** (for automatic status updates):
   - Settings → Webhooks
   - Add URL: `https://your-domain/api/webhooks/razorpay`
   - Events: `payout.processed`, `payout.failed`, `payout.queued`, `payout.reversed`
   - Copy webhook secret to `.env`

### How Real Withdrawal Works

1. User requests withdrawal with bank account or UPI details
2. Admin approves withdrawal
3. Backend calls Razorpay Payouts API
4. Payout is sent to user's bank/UPI account
5. Webhook automatically updates status when payout completes/fails

Supported methods:
- **Bank Transfer**: NEFT (next business day)
- **UPI**: Instant transfer

---

