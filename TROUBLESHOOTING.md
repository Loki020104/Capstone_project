# Troubleshooting: Upload Failed - 401 Error

## What Happened?

You saw the error: **"Upload failed: 401"** or **"Session expired. Please sign in again to refresh your token."**

This happens when:
1. Your authentication token expired
2. The backend was restarted (clears in-memory token store)
3. Your session is no longer valid

---

## How to Fix It

### ✅ Solution 1: Sign In Again (Recommended)

1. Click the **"Sign Out"** button or navigate back to the Home page
2. Click **"🏫 University Login"** (or Student Login)
3. Enter your credentials:
   - **Email**: `faculty@gmail.com` (or your registered email)
   - **Password**: `test123` (or your registered password)
4. Click **"Sign In"**
5. You'll get a fresh token
6. Navigate back to **Upload** and try again

### ✅ Solution 2: Auto-Refresh Token

The frontend now automatically refreshes expired tokens when you load the Upload page:

1. Go to the **Upload** page
2. It will automatically sign you in again using your saved credentials
3. You'll get a fresh token without manual intervention

### ✅ Solution 3: Use Demo Credentials

If you haven't created an account yet, use these demo credentials:

**Faculty Login:**
- Email: `faculty@gmail.com`
- Password: `test123`
- Role: University

**Student Login:**
- Email: `student@example.com`
- Password: `test123`
- Role: Student

These are pre-configured and always work!

---

## Why Does This Happen?

This is a **demo application** that uses in-memory storage:

- **No Database**: All tokens are stored in RAM, not a database
- **Token Loss on Restart**: When the backend restarts, all tokens are cleared
- **Demo Only**: For production, use a database (PostgreSQL, MongoDB, etc.) and persistent token storage

---

## How to Avoid It

### During Development:
- **Don't restart the backend** while testing (keep it running)
- **Keep the browser tab open** with your token
- **Sign in once** and stay logged in

### For Production:
- Use a database (PostgreSQL, MongoDB) to store tokens
- Implement token expiration and refresh mechanisms
- Use JWT (JSON Web Tokens) with secure storage
- Add HTTPS/SSL for security

---

## Testing the Fix

After signing in again:

1. Go to **Upload** page
2. Select a CSV file (`student_dropout_dataset.csv`)
3. Click **"Upload & Run Analysis"**
4. Should see: **"✅ Upload successful"** with at-risk students list
5. Click **"📊 View Analysis Results"** to see the analysis and student details table

---

## Still Having Issues?

**Check the backend is running:**
```bash
ps aux | grep app.py
```

Should show: `python3 app.py` running

**If not running, restart it:**
```bash
cd /Users/vasif/Desktop/Capstone_project/student-dropout-web/backend
python3 app.py
```

**Check the backend logs:**
```bash
tail -50 /Users/vasif/Desktop/Capstone_project/student-dropout-web/backend/logs/actions.log
```

Look for `UPLOAD` entries with `token validation result`.

---

## Summary

| Issue | Solution |
|-------|----------|
| **Upload failed: 401** | Sign in again to get a fresh token |
| **Session expired** | Click Sign Out, then Sign In again |
| **Backend unreachable** | Restart backend with `python3 app.py` |
| **Can't remember password** | Use demo credentials: `faculty@gmail.com` / `test123` |
| **Lost access** | Clear browser cache and sign in again |

---

**Remember**: This is a demo app. For production use, implement proper authentication with a database and secure token storage! 🎓
