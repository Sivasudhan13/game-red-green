# 🔧 Fix MongoDB Atlas Connection Error

## ❌ Error Message

```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster.
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## ✅ Quick Fix Steps

### Step 1: Get Your Current IP Address

**Option A: Using Browser**

1. Go to: https://www.whatismyip.com/
2. Copy your **IPv4 Address**

**Option B: Using Command Line**

```bash
# Windows (PowerShell)
(Invoke-WebRequest -Uri "https://api.ipify.org").Content

# Linux/Mac
curl https://api.ipify.org
```

### Step 2: Whitelist Your IP in MongoDB Atlas

1. **Login to MongoDB Atlas**

   - Go to: https://cloud.mongodb.com
   - Sign in with your account

2. **Navigate to Network Access**

   - Click on your **Project** (top left)
   - Click **Network Access** in the left sidebar
   - Or go directly to: https://cloud.mongodb.com/v2#/security/network/whitelist

3. **Add IP Address**

   - Click **"Add IP Address"** button
   - Choose one of these options:

   **Option A: Add Your Current IP (Recommended)**

   - Click **"Add Current IP Address"** button
   - Or manually enter your IP address
   - Click **"Confirm"**

   **Option B: Allow All IPs (Development Only - ⚠️ Not Secure)**

   - Enter: `0.0.0.0/0`
   - Click **"Confirm"**
   - ⚠️ **Warning**: Only use this for development/testing!

4. **Wait for Changes**
   - Wait 1-2 minutes for changes to propagate
   - The status will show "Active" when ready

### Step 3: Verify Connection String

Check your `backend/.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Important:**

- Replace `username` with your MongoDB Atlas username
- Replace `password` with your MongoDB Atlas password
- Replace `cluster.mongodb.net` with your actual cluster URL
- Replace `database` with your database name (e.g., `game-bet`)

### Step 4: Restart Your Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
cd backend
npm start
```

You should now see:

```
✅ MongoDB connected successfully
📊 Database: game-bet
🚀 Server running on port 5000
```

---

## 🔍 Troubleshooting

### Still Getting Connection Error?

1. **Check IP Address Changed**

   - If you're on a dynamic IP, it might have changed
   - Get your new IP and add it again

2. **Check Connection String**

   - Verify username and password are correct
   - Make sure there are no extra spaces
   - Check if special characters in password are URL-encoded

3. **Check Cluster Status**

   - Go to MongoDB Atlas → Clusters
   - Make sure cluster is **not paused**
   - If paused, click "Resume"

4. **Check Database User Permissions**

   - Go to: Database Access
   - Make sure your user has "Read and write to any database" permission

5. **Try Using Local MongoDB (Alternative)**
   - Install MongoDB locally
   - Update `.env`:
     ```env
     MONGODB_URI=mongodb://localhost:27017/game-bet
     ```

---

## 📝 Common Issues

### Issue: "IP address keeps changing"

**Solution:** Use `0.0.0.0/0` for development (not recommended for production)

### Issue: "Connection works sometimes but not always"

**Solution:**

- Your IP might be dynamic
- Add multiple IP ranges
- Or use `0.0.0.0/0` for development

### Issue: "Can't find Network Access option"

**Solution:**

- Make sure you're logged into the correct MongoDB Atlas account
- Check if you have admin access to the project

---

## ✅ Verification

After fixing, you should see in your server logs:

```
✅ MongoDB connected successfully
📊 Database: game-bet
🚀 Server running on port 5000
📍 API URL: http://localhost:5000/api
```

Test the connection:

```bash
curl http://localhost:5000/api/health
```

Should return:

```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## 🆘 Still Need Help?

1. Check MongoDB Atlas status: https://status.mongodb.com/
2. Review MongoDB Atlas documentation: https://docs.atlas.mongodb.com/
3. Check server logs for detailed error messages

---

**Last Updated:** The server now provides detailed error messages to help diagnose connection issues automatically!

