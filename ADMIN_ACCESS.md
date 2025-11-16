# How to Access Admin Dashboard

## Step-by-Step Guide

### Step 1: Register a User Account

1. Go to http://localhost:3000
2. Click **Register**
3. Fill in the registration form:
   - Name
   - Email
   - Password (min 6 characters)
   - Invite Code (optional)
4. Click **Register**

### Step 2: Make the User an Admin

After registering, you need to make your account an admin. You have two options:

#### Option A: Using the Script (Recommended)

Run this command in your terminal:

```bash
node backend/scripts/createAdmin.js your-email@example.com
```

Replace `your-email@example.com` with the email you used to register.

#### Option B: Using MongoDB Directly

1. Open MongoDB shell or MongoDB Compass
2. Connect to your database
3. Run this command:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Replace `your-email@example.com` with your registered email.

### Step 3: Access Admin Dashboard

After making your account admin, you have **3 ways** to access:

#### Method 1: Direct URL
- Go to: `http://localhost:3000/admin`
- You must be logged in first

#### Method 2: Admin Button (Easiest)
- Login to your account
- Look at the top-right header
- You'll see an **"Admin"** button (red button)
- Click it to go to admin dashboard

#### Method 3: After Login Redirect
- Login with your admin account
- The admin button will appear automatically in the header

---

## Admin Dashboard Features

Once you access the admin dashboard, you can:

1. **View Statistics**
   - Total Users
   - Total Deposits
   - Total Withdrawals
   - Total Commission

2. **Manage Withdrawals**
   - View all pending withdrawal requests
   - Approve withdrawals
   - Reject withdrawals (amount refunded to user)

3. **View All Users**
   - See all registered users
   - View user details

---

## Troubleshooting

### "Access denied" or redirected to home page
- **Solution**: Your account is not set as admin
- Run: `node backend/scripts/createAdmin.js your-email@example.com`

### Admin button not showing
- **Solution**: Make sure you're logged in and your account has admin role
- Check by logging out and logging back in

### Can't access /admin URL
- **Solution**: You must be logged in first
- The route is protected and requires admin role

---

## Quick Test

1. Register: `test@admin.com` / `password123`
2. Make admin: `node backend/scripts/createAdmin.js test@admin.com`
3. Login: Use `test@admin.com` / `password123`
4. Click "Admin" button or go to `/admin`

---

## Security Note

- Only users with `role: "admin"` can access the admin dashboard
- Regular users will be redirected to home page if they try to access `/admin`
- Admin routes are protected on both frontend and backend



