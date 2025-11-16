# Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment Variables

#### Backend (.env file in backend directory)

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/game-bet
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

#### Frontend (.env file in frontend directory)

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if installed as service, it should auto-start)
# Or start manually:
mongod

# Linux/Mac
sudo systemctl start mongod
# or
mongod
```

### 4. Start the Application

#### Option 1: Run both servers together

```bash
npm run dev
```

#### Option 2: Run separately

Terminal 1 (Backend):

```bash
npm run server
```

Terminal 2 (Frontend):

```bash
cd frontend
npm start
```

### 5. Create Admin User

1. First, register a user through the web interface
2. Then run the admin creation script:

```bash
node backend/scripts/createAdmin.js your-email@example.com
```

Or manually update in MongoDB:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
);
```

## Stripe Setup

1. Sign up at https://stripe.com
2. Get your API keys from the dashboard (Test mode for development)
3. Add them to `backend/.env`:
   - `STRIPE_SECRET_KEY` (starts with `sk_test_` for test mode)
4. Add to `frontend/.env`:
   - `REACT_APP_STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_` for test mode)

## Testing the Application

1. Open http://localhost:3000
2. Register a new account
3. Deposit money (use Stripe test mode)
4. Place bets on colors
5. Wait for game results (every 1 minute)

## Production Deployment

### Backend

- Use environment variables for all secrets
- Set up MongoDB Atlas or production MongoDB
- Use PM2 or similar for process management
- Enable HTTPS

### Frontend

- Build the app: `cd frontend && npm run build`
- Serve the `build` folder with a web server (nginx, Apache, etc.)
- Update `REACT_APP_API_URL` to your production API URL

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check the connection string in `.env`
- Verify MongoDB is accessible

### Stripe Payment Issues

- Use test mode keys for development (keys starting with `sk_test_` and `pk_test_`)
- Check Stripe dashboard for payment status
- Verify API keys are correct
- Ensure Stripe publishable key is set in frontend `.env`

### Game Not Processing

- Check backend logs for errors
- Ensure game processor is running (it starts automatically with the server)
- Verify MongoDB connection
