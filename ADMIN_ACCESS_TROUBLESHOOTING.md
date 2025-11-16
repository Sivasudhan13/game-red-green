# Admin Dashboard Access - Troubleshooting Guide

## Why You Can't Access `/admin`

The admin dashboard is **protected** and requires:

1. ✅ You must be **logged in**
2. ✅ Your account must have **admin role**

---

## Step-by-Step Solution

### Step 1: Login First

**You MUST login before accessing `/admin`**

1. Go to: http://localhost:3000/login
2. Enter your credentials:
   - Email: `sivasudhan87@gmail.com`
   - Password: `908090@Thala`
3. Click **Login**

### Step 2: Access Admin Dashboard

**After logging in, you have 2 options:**

#### Option A: Use Admin Button (Recommended)

- Look at the **top-right corner** of the page
- You'll see a red **"Admin"** button
- Click it to go to admin dashboard

#### Option B: Direct URL

- After logging in, go to: `http://localhost:3000/admin`
- The page will load if you're logged in as admin

---

## What You'll See

### ✅ If You're Logged In as Admin:

- Admin dashboard loads successfully
- You see statistics and withdrawal management

### ❌ If You're NOT Logged In:

- You'll see: **"Access Denied - You need to be logged in"**
- Click **"Go to Login"** button

### ❌ If You're Logged In but NOT Admin:

- You'll see: **"Access Denied - You don't have admin privileges"**
- Shows your current role
- Click **"Back to Game"** button

---

## Quick Fix Checklist

- [ ] **Login first** at http://localhost:3000/login
- [ ] Use email: `sivasudhan87@gmail.com`
- [ ] Use password: `908090@Thala`
- [ ] After login, click **"Admin"** button in header
- [ ] Or visit: `http://localhost:3000/admin`

---

## Verify Your Admin Status

If you're still having issues, verify your account is admin:

```bash
node backend/scripts/checkUser.js sivasudhan87@gmail.com
```

This will show:

- Your email
- Your role (should be "admin")
- Account status

---

## Common Issues

### Issue 1: "Access Denied - You need to be logged in"

**Solution**: Login first at http://localhost:3000/login

### Issue 2: "Access Denied - You don't have admin privileges"

**Solution**: Your account might not be set as admin. Run:

```bash
node backend/scripts/createAdmin.js sivasudhan87@gmail.com
```

### Issue 3: Page redirects to home

**Solution**:

1. Clear browser cache
2. Logout and login again
3. Make sure you're using the correct email/password

### Issue 4: Blank page or error

**Solution**:

1. Check browser console for errors (F12)
2. Check backend server is running (port 5000)
3. Check MongoDB is connected

---

## Still Can't Access?

1. **Check if you're logged in:**

   - Look at top-right corner
   - Do you see "Welcome, [your name]"?
   - If not, you need to login

2. **Check your role:**

   - After login, check browser console (F12)
   - Look for user object
   - Verify `role: "admin"`

3. **Try this:**
   - Logout completely
   - Clear browser localStorage
   - Login again
   - Then try accessing `/admin`

---

## ✅ Your Account Details

- **Email**: `sivasudhan87@gmail.com`
- **Password**: `908090@Thala`
- **Role**: `admin` ✅
- **Status**: `active` ✅

---

## Quick Test

1. Open http://localhost:3000
2. Click **Login** (top-right)
3. Enter credentials
4. After login, you should see **"Admin"** button
5. Click **"Admin"** button
6. Admin dashboard should open!

If the "Admin" button doesn't appear, your account might not be admin. Run the createAdmin script again.


