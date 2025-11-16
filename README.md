# OK.Win - Color Betting Game

A MERN stack betting game application where users can bet on Red, Green, or Violet colors. The game runs every 1 minute with automatic result processing.

## Features

- **User Authentication**: Register and login with JWT tokens
- **Color Betting**: Bet on Red, Green, or Violet colors
- **Game Engine**: Color with lowest payout wins, highest payout loses
- **Wallet System**: Deposit and withdraw money (with admin approval for withdrawals)
- **Stripe Integration**: Secure payment processing for deposits
- **Referral System**: Unique invite codes with ₹25 bonus per referral
- **Admin Dashboard**: Approve/reject withdrawals and view statistics
- **Game History**: View past game results
- **Responsive Design**: Works on all devices with Tailwind CSS

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React, React Router DOM, Tailwind CSS v3
- **Payment**: Stripe
- **Notifications**: React Toastify

## Installation

> **📖 For detailed npm installation commands, see [NPM_INSTALLATION_GUIDE.md](./NPM_INSTALLATION_GUIDE.md)**

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Stripe account (for payment integration)

### Quick Install

```bash
# Install all dependencies (root, backend, frontend)
npm run install-all
```

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/game-bet
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
STRIPE_SECRET_KEY=your-stripe-secret-key
```

4. Start the backend server:

```bash
npm run dev
# or for production
npm start
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

4. Start the frontend development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Game Rules

1. **Betting**: Users can bet on Red, Green, or Violet colors
2. **Win Condition**: If the selected color wins, user gets 2x the bet amount
3. **Loss Condition**: If the selected color loses, user loses the bet amount
4. **Game Duration**: Each game runs for 1 minute
5. **Game Engine**: The color with the lowest total bet amount wins, highest loses
6. **Admin Commission**: Admin gets ₹1-10 per game based on total bet amount

## Deposit & Withdrawal Limits

- **Deposit**: Minimum ₹70, Maximum ₹50,000
- **Withdrawal**: Minimum ₹110, Maximum ₹50,000 (requires admin approval)

## Referral System

- Each user gets a unique invite code
- When someone registers using your invite code, you get ₹25 bonus
- Share your invite code to earn more!

## Admin Features

- View dashboard statistics
- Approve/reject withdrawal requests
- View all users and transactions

## Creating an Admin User

To create an admin user, you can use MongoDB shell or a MongoDB client:

```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Game

- `GET /api/game/current` - Get current game
- `POST /api/game/bet` - Place a bet
- `GET /api/game/history` - Get game history
- `GET /api/game/my-bets` - Get user's bets

### Payment

- `POST /api/payment/deposit` - Create deposit order
- `POST /api/payment/confirm-deposit` - Confirm Stripe payment
- `POST /api/payment/withdraw` - Request withdrawal
- `GET /api/payment/transactions` - Get user transactions

### Admin

- `GET /api/admin/withdrawals` - Get pending withdrawals
- `POST /api/admin/approve-withdrawal/:id` - Approve withdrawal
- `POST /api/admin/reject-withdrawal/:id` - Reject withdrawal
- `GET /api/admin/stats` - Get dashboard statistics

## Project Structure

```
game-bet/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── services/    # API services
│   │   └── App.js       # Main app component
│   └── public/          # Static files
└── package.json
```

## License

ISC
