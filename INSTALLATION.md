# Installation Guide

> **📖 For detailed npm commands, see [NPM_INSTALLATION_GUIDE.md](./NPM_INSTALLATION_GUIDE.md)**

## Quick Install (All at Once)

From the **root directory**:

```bash
npm run install-all
```

This will install dependencies for:
- Root (concurrently only)
- Backend
- Frontend

---

## Separate Installation

### Backend Installation

```bash
cd backend
npm install
```

Or from root:
```bash
npm run install-backend
```

### Frontend Installation

```bash
cd frontend
npm install
```

Or from root:
```bash
npm run install-frontend
```

---

## Running the Application

### Option 1: Run Both Together (Recommended)

From **root directory**:

```bash
npm run dev
```

This runs:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

---

## Package.json Structure

### Root `package.json`
- Only contains scripts to run both servers
- Uses `concurrently` to run backend and frontend together
- No application dependencies

### `backend/package.json`
- All backend dependencies (Express, MongoDB, Stripe, etc.)
- Backend-specific scripts
- Server entry point

### `frontend/package.json`
- All frontend dependencies (React, React Router, Stripe, etc.)
- Frontend-specific scripts
- React app configuration

---

## Available Scripts

### Root Scripts
- `npm run dev` - Run both backend and frontend
- `npm run install-all` - Install all dependencies
- `npm run install-backend` - Install backend dependencies only
- `npm run install-frontend` - Install frontend dependencies only

### Backend Scripts (from `backend/` directory)
- `npm start` - Run production server
- `npm run dev` - Run development server with nodemon
- `npm run create-admin` - Create admin user
- `npm run check-user` - Check user details
- `npm run reset-password` - Reset user password

### Frontend Scripts (from `frontend/` directory)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

---

## Project Structure

```
game-bet/
├── package.json          # Root - scripts only
├── backend/
│   ├── package.json      # Backend dependencies
│   ├── server.js
│   ├── models/
│   ├── routes/
│   └── ...
└── frontend/
    ├── package.json      # Frontend dependencies
    ├── src/
    └── ...
```

---

## First Time Setup

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables:**
   - Create `backend/.env` (see API_KEYS_REQUIRED.md)
   - Create `frontend/.env` (see API_KEYS_REQUIRED.md)

3. **Start the application:**
   ```bash
   npm run dev
   ```

4. **Create admin user:**
   ```bash
   cd backend
   npm run create-admin your-email@example.com
   ```

---

## Troubleshooting

### "Module not found" errors
- Make sure you've run `npm install` in the respective directory
- Backend dependencies: `cd backend && npm install`
- Frontend dependencies: `cd frontend && npm install`

### Port already in use
- Backend uses port 5000
- Frontend uses port 3000
- Change ports in `.env` files if needed

### Concurrently not found
- Run `npm install` in root directory
- This installs `concurrently` for running both servers

