# Quick Start Guide

## 1. Install Dependencies

```bash
# Root directory
npm install

# Frontend directory
cd frontend
npm install
cd ..
```

## 2. Setup Environment Files

### Backend (.env)
Create `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/game-bet
JWT_SECRET=change-this-to-a-random-secret-key
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### Frontend (.env)
Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 3. Start MongoDB

Make sure MongoDB is running on your system.

## 4. Run the Application

```bash
# Run both backend and frontend together
npm run dev
```

Or separately:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
cd frontend
npm start
```

## 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 6. Create Admin User

1. Register a user through the web interface
2. Run: `node backend/scripts/createAdmin.js your-email@example.com`

## 7. Test the Game

1. Register/Login
2. Deposit money (use Razorpay test mode)
3. Place bets on colors
4. Wait for game results (auto-processes every minute)

## Important Notes

- Game page is visible without login
- Login required only to place bets
- Minimum deposit: ₹70, Maximum: ₹50,000
- Minimum withdrawal: ₹110, Maximum: ₹50,000
- Withdrawals require admin approval
- Each game runs for 1 minute
- Winners get 2x their bet amount



