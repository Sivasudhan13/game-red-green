# Project Summary - OK.Win Color Betting Game

## ✅ Completed Features

### Authentication & User Management

- ✅ User registration with email/password
- ✅ User login with JWT tokens
- ✅ Protected routes for authenticated users
- ✅ User profile management
- ✅ Unique invite code generation for each user
- ✅ Referral system (₹25 bonus per referral)

### Game Features

- ✅ Red, Green, Violet color betting game
- ✅ 1-minute game rounds (automatic processing)
- ✅ Game engine: Lowest bet amount color wins, highest loses
- ✅ Real-time countdown timer
- ✅ Game history display
- ✅ Previous winning colors and numbers shown
- ✅ Number grid (0-9) with color coding
- ✅ Bet placement with amount selection
- ✅ Win: 2x bet amount, Loss: lose bet amount
- ✅ Admin commission: ₹1-10 per game based on total bets

### Wallet & Payments

- ✅ Wallet balance display
- ✅ Deposit via Razorpay (₹70 - ₹50,000)
- ✅ Withdrawal requests (₹110 - ₹50,000)
- ✅ Admin approval required for withdrawals
- ✅ Transaction history
- ✅ Balance refresh functionality

### Admin Dashboard

- ✅ View pending withdrawals
- ✅ Approve/reject withdrawal requests
- ✅ Dashboard statistics (users, deposits, withdrawals, commission)
- ✅ Admin-only routes protection

### UI/UX

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Tailwind CSS v3 styling
- ✅ React Toastify for notifications
- ✅ Game page shown first (no login required to view)
- ✅ Login required only to place bets
- ✅ Modern, clean interface with color-coded elements
- ✅ Real-time game updates

### Technical Implementation

- ✅ MERN stack (MongoDB, Express, React, Node.js)
- ✅ RESTful API architecture
- ✅ JWT authentication
- ✅ MongoDB models (User, Game, Bet, Transaction)
- ✅ Automatic game processing (cron-like interval)
- ✅ Error handling and validation
- ✅ Environment variables for configuration
- ✅ CORS enabled for API access

## 📁 Project Structure

```
game-bet/
├── backend/
│   ├── models/
│   │   ├── User.js          # User model with wallet, invite code
│   │   ├── Game.js          # Game model with results
│   │   ├── Bet.js           # Bet model
│   │   └── Transaction.js   # Transaction model
│   ├── routes/
│   │   ├── auth.js          # Register, login, get user
│   │   ├── game.js          # Game operations, betting
│   │   ├── payment.js       # Deposit, withdraw, transactions
│   │   ├── admin.js         # Admin operations
│   │   └── user.js          # User profile
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── utils/
│   │   └── gameProcessor.js # Automatic game result processing
│   ├── scripts/
│   │   └── createAdmin.js   # Script to create admin user
│   └── server.js            # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WalletSection.js    # Wallet display, deposit/withdraw buttons
│   │   │   ├── GameBoard.js        # Main game board with colors
│   │   │   ├── GameHistory.js      # Past game results
│   │   │   ├── BetModal.js         # Bet placement modal
│   │   │   ├── DepositModal.js     # Deposit modal with Razorpay
│   │   │   └── WithdrawModal.js    # Withdrawal request modal
│   │   ├── pages/
│   │   │   ├── GamePage.js         # Main game page
│   │   │   ├── Login.js            # Login page
│   │   │   ├── Register.js        # Registration page
│   │   │   └── AdminDashboard.js  # Admin dashboard
│   │   ├── context/
│   │   │   └── AuthContext.js      # Authentication context
│   │   ├── services/
│   │   │   └── api.js              # Axios API client
│   │   ├── App.js                  # Main app component
│   │   └── index.js                # React entry point
│   └── package.json
├── package.json
├── README.md
├── SETUP.md
└── .gitignore
```

## 🎮 Game Flow

1. **User visits site** → Sees game page immediately (no login required)
2. **User wants to bet** → Redirected to login/register
3. **User registers/logs in** → Returns to game page
4. **User deposits money** → Via Razorpay payment gateway
5. **User places bet** → Selects color and amount
6. **Game ends (1 minute)** → Automatic processing:
   - Color with lowest total bets wins
   - Winners get 2x their bet amount
   - Losers lose their bet amount
   - Admin gets commission (₹1-10)
7. **User can withdraw** → Request sent to admin for approval
8. **Admin approves** → User receives money

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Admin-only routes protection
- Input validation
- Razorpay payment verification

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS breakpoints
- Touch-friendly buttons
- Optimized for all screen sizes

## 🚀 Getting Started

See `SETUP.md` for detailed installation and configuration instructions.

## 📝 Environment Variables Required

### Backend

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `RAZORPAY_KEY_ID` - Razorpay API key ID
- `RAZORPAY_KEY_SECRET` - Razorpay API secret

### Frontend

- `REACT_APP_API_URL` - Backend API URL

## 🎯 Key Features Summary

1. **Game shows first** - Users can view the game without logging in
2. **Login required for betting** - Only authenticated users can place bets
3. **Deposit required** - Users need money in wallet to bet
4. **1-minute games** - Automatic game processing every minute
5. **Smart game engine** - Lowest bet color wins (prevents manipulation)
6. **Admin control** - Withdrawal approval system
7. **Referral rewards** - ₹25 per successful referral
8. **Transaction history** - Complete audit trail

## 🔄 Game Processing Logic

The game processor runs every 10 seconds and checks:

1. If a live game exists
2. If the game end time has passed
3. Processes results:
   - Finds color with lowest total bet amount (wins)
   - Finds color with highest total bet amount (loses)
   - Awards winners 2x their bet
   - Records losses
   - Calculates admin commission
4. Creates new game for next round

This ensures games run continuously every minute automatically.


