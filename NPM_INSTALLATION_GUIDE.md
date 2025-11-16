# NPM Installation Guide

Complete guide for installing dependencies for backend and frontend.

---

## 🚀 Quick Start (Install Everything)

From the **root directory**:

```bash
npm run install-all
```

This command installs:
- Root dependencies (concurrently)
- Backend dependencies
- Frontend dependencies

---

## 📦 Installation Methods

### Method 1: Install All at Once (Recommended)

**From root directory:**

```bash
npm run install-all
```

**What it does:**
1. Installs root dependencies (`concurrently`)
2. Installs backend dependencies
3. Installs frontend dependencies

---

### Method 2: Install Separately

#### Step 1: Install Root Dependencies

**From root directory:**

```bash
npm install
```

**What it installs:**
- `concurrently` (for running both servers together)

---

#### Step 2: Install Backend Dependencies

**Option A - From root directory:**
```bash
npm run install-backend
```

**Option B - From backend directory:**
```bash
cd backend
npm install
```

**What it installs:**
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `stripe` - Payment gateway
- `nodemon` - Development server (dev dependency)

---

#### Step 3: Install Frontend Dependencies

**Option A - From root directory:**
```bash
npm run install-frontend
```

**Option B - From frontend directory:**
```bash
cd frontend
npm install
```

**What it installs:**
- `react` - React library
- `react-dom` - React DOM renderer
- `react-router-dom` - Routing
- `react-toastify` - Toast notifications
- `axios` - HTTP client
- `@stripe/stripe-js` - Stripe JavaScript SDK
- `@stripe/react-stripe-js` - Stripe React components
- `react-scripts` - Create React App scripts (dev dependency)
- `tailwindcss` - CSS framework (dev dependency)
- `autoprefixer` - CSS autoprefixer (dev dependency)
- `postcss` - CSS processor (dev dependency)

---

## 📋 Complete Installation Steps

### First Time Setup

```bash
# 1. Navigate to project root
cd game-bet

# 2. Install all dependencies
npm run install-all

# 3. Set up environment variables
# Create backend/.env (see API_KEYS_REQUIRED.md)
# Create frontend/.env (see API_KEYS_REQUIRED.md)

# 4. Start the application
npm run dev
```

---

## 🔧 Individual Installation Commands

### Backend Only

```bash
# From root
npm run install-backend

# OR from backend directory
cd backend
npm install
```

### Frontend Only

```bash
# From root
npm run install-frontend

# OR from frontend directory
cd frontend
npm install
```

### Root Only

```bash
# From root directory
npm install
```

---

## 📁 Directory Structure After Installation

```
game-bet/
├── node_modules/          # Root dependencies (concurrently)
├── package.json
├── backend/
│   ├── node_modules/      # Backend dependencies
│   ├── package.json
│   └── ...
└── frontend/
    ├── node_modules/       # Frontend dependencies
    ├── package.json
    └── ...
```

---

## ✅ Verification

### Check if Backend Dependencies are Installed

```bash
cd backend
ls node_modules
# Should see: express, mongoose, bcryptjs, etc.
```

### Check if Frontend Dependencies are Installed

```bash
cd frontend
ls node_modules
# Should see: react, react-dom, react-router-dom, etc.
```

### Check Package Versions

**Backend:**
```bash
cd backend
npm list --depth=0
```

**Frontend:**
```bash
cd frontend
npm list --depth=0
```

---

## 🛠️ Troubleshooting

### Issue: "npm: command not found"

**Solution:**
- Install Node.js from https://nodejs.org/
- Verify installation: `node --version` and `npm --version`

### Issue: "EACCES: permission denied"

**Solution:**
- Use `sudo` (Linux/Mac): `sudo npm install`
- Or fix npm permissions: `npm config set prefix ~/.npm-global`

### Issue: "Module not found" errors

**Solution:**
- Make sure you've run `npm install` in the correct directory
- Delete `node_modules` and `package-lock.json`, then reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Issue: Installation takes too long

**Solution:**
- Use npm cache: `npm cache verify`
- Or use yarn: `yarn install` (if yarn is installed)

### Issue: Version conflicts

**Solution:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- If still issues, check Node.js version (should be v14+)

---

## 🔄 Reinstalling Dependencies

### Reinstall Everything

```bash
# From root
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Then reinstall
npm run install-all
```

### Reinstall Backend Only

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Reinstall Frontend Only

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Installation Time Estimates

- **Root dependencies**: ~5-10 seconds
- **Backend dependencies**: ~30-60 seconds
- **Frontend dependencies**: ~2-5 minutes (due to React and build tools)
- **Total**: ~3-6 minutes

---

## 🎯 Quick Reference

| Command | Location | What It Does |
|---------|----------|--------------|
| `npm run install-all` | Root | Installs all dependencies |
| `npm run install-backend` | Root | Installs backend dependencies |
| `npm run install-frontend` | Root | Installs frontend dependencies |
| `npm install` | Root | Installs root dependencies only |
| `npm install` | Backend | Installs backend dependencies |
| `npm install` | Frontend | Installs frontend dependencies |

---

## 📝 Notes

1. **Always install from the correct directory**
   - Root: For root dependencies
   - Backend: For backend dependencies
   - Frontend: For frontend dependencies

2. **Installation order doesn't matter**
   - You can install backend and frontend in any order
   - Root dependencies should be installed first if using `npm run dev`

3. **Package-lock.json**
   - Automatically generated during `npm install`
   - Should be committed to Git (for consistent versions)

4. **Node.js Version**
   - Recommended: Node.js v14 or higher
   - Check version: `node --version`

---

## 🚀 After Installation

Once dependencies are installed:

1. **Set up environment variables:**
   - `backend/.env`
   - `frontend/.env`

2. **Start the application:**
   ```bash
   npm run dev
   ```

3. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

---

## 💡 Pro Tips

1. **Use `npm ci` for production:**
   ```bash
   npm ci  # Faster, uses package-lock.json exactly
   ```

2. **Check outdated packages:**
   ```bash
   npm outdated
   ```

3. **Update packages:**
   ```bash
   npm update
   ```

4. **Clear npm cache if issues:**
   ```bash
   npm cache clean --force
   ```

---

## ✅ Installation Checklist

- [ ] Node.js installed (v14+)
- [ ] npm installed
- [ ] Root dependencies installed
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment variables configured
- [ ] Application starts successfully

---

**Need help?** Check `INSTALLATION.md` or `SETUP.md` for more details.



