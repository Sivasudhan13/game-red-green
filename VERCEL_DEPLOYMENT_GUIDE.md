# Vercel Frontend Deployment - Step by Step Guide

## Problem
Your Vercel build is failing because it can't find `index.html`. This happens when:
1. Vercel doesn't know to build from the `frontend/` folder (monorepo issue)
2. The `index.html` file wasn't tracked in git

## Solution

### Step 1: ✅ DONE - Files are now committed
- `frontend/public/index.html` is now pushed to GitHub
- `vercel.json` is configured

### Step 2: Configure Vercel Project Settings

Go to **Vercel Dashboard** and do the following:

#### A. Set Root Directory
1. Click on your project
2. Go to **Settings** → **General**
3. Find **Root Directory** (or "Build Scope")
4. Change it from `/` to `frontend/`
5. Click **Save**

#### B. Set Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add this variable:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://your-backend-url.com/api` (or `http://localhost:5000/api` for testing)
   - Click **Save**

Example backend URLs (choose based on where you deploy backend):
- Railway: `https://your-app.up.railway.app/api`
- Render: `https://your-app.onrender.com/api`
- Heroku: `https://your-app.herokuapp.com/api`
- Local Dev: `http://localhost:5000/api`

#### C. Verify Build Settings
1. **Build Command:** Should be `npm run build` (auto-detected)
2. **Install Command:** Should be `npm install` (auto-detected)
3. **Output Directory:** Should be `build` (auto-detected)

### Step 3: Trigger Redeploy

Option A (Automatic):
- The new commits you just pushed will automatically trigger a rebuild
- Check **Deployments** tab to see build progress

Option B (Manual from Vercel UI):
1. Go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Click **Redeploy**

### Step 4: Wait for Build to Complete
- Watch the **Deployments** tab
- Build should take 2-5 minutes
- Look for green checkmark ✅

### Step 5: Test Frontend
Once build succeeds:
1. Click the deployment URL (e.g., `https://your-app.vercel.app`)
2. Frontend should load
3. Register/login should work if backend is running

---

## Troubleshooting

### Still Getting "index.html not found" Error?
1. Double-check the **Root Directory** is set to `frontend/`
2. Check that `frontend/public/index.html` appears in your GitHub repo
3. If just changed root directory, click **Redeploy** in Vercel

### Frontend loads but can't connect to backend?
1. Verify `REACT_APP_API_URL` environment variable is set
2. Check your backend is running and accessible from the internet
3. Verify CORS is enabled on backend: `app.use(cors())`
4. Test backend URL directly in browser: `https://your-backend/api/health`

### Environment Variable not being used?
- Environment variables in Vercel are injected at **build time**
- If you changed `REACT_APP_API_URL`, you must **redeploy**
- The variable name MUST start with `REACT_APP_` for Create React App

---

## Backend Deployment (Separate Service)

For now, your backend isn't deployed yet. Here's where to deploy it:

### Option 1: Railway (Recommended - Easy)
```bash
npm install -g railway
railway login
cd backend
railway init
railway up
```
Then set environment variables in Railway dashboard.

### Option 2: Render.com
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repo
4. Set build directory to `backend/`
5. Start command: `node server.js`

### Option 3: Heroku (if you have account)
```bash
heroku login
cd backend
heroku create your-app-name
git push heroku main
```

After backend is deployed, update `REACT_APP_API_URL` in Vercel to the backend URL.

---

## After Both Are Deployed

1. Frontend: `https://your-frontend.vercel.app`
2. Backend: `https://your-backend.railway.app` (or wherever you deploy it)
3. Update `REACT_APP_API_URL` in Vercel to `https://your-backend.railway.app/api`
4. Redeploy frontend
5. Test full flow: register → login → bet → withdraw

---

## Quick Checklist

- [ ] `frontend/public/index.html` is in GitHub repo
- [ ] `vercel.json` exists in root of repo
- [ ] Vercel project has **Root Directory** set to `frontend/`
- [ ] Vercel has `REACT_APP_API_URL` environment variable set
- [ ] Backend is deployed somewhere (Railway/Render/Heroku)
- [ ] Backend URL is set in Vercel env var
- [ ] Frontend deployment succeeds with green checkmark ✅
- [ ] Frontend loads in browser
- [ ] Frontend can call backend API

---

