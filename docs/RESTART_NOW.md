# 🚨 URGENT: RESTART SERVER NOW!

## The Issue
Manual Attendance shows "Failed to load students" because **SERVER IS NOT RESTARTED**.

## The Fix (30 seconds)

### 1️⃣ Find Your Server Terminal
Look for the terminal window running your backend server.

### 2️⃣ Stop Server
Press: **Ctrl + C**

### 3️⃣ Start Server
Type: **node server.js**
Press: **Enter**

### 4️⃣ Refresh Browser
Press: **Ctrl + Shift + R**

### 5️⃣ Test
Login as Teacher 81 → Manual Attendance → See 21 students ✓

---

## Visual Guide

```
┌─────────────────────────────────────────┐
│ Terminal (Backend Server)               │
├─────────────────────────────────────────┤
│ $ cd server                             │
│ $ node server.js                        │
│ Server running on http://0.0.0.0:5000  │
│                                         │
│ Press Ctrl+C to stop ←─────────────────┤
│                                         │
│ $ node server.js ←──────────────────────┤
│ Server running on http://0.0.0.0:5000  │
│ ✓ Ready!                                │
└─────────────────────────────────────────┘
```

---

## Why This Happens

❌ **Before Restart**
- Old code running
- New routes not loaded
- `/api/students` returns 404
- Manual Attendance fails

✅ **After Restart**
- New code loaded
- Routes working
- `/api/students` returns students
- Manual Attendance works

---

## Quick Checklist

- [ ] Terminal found
- [ ] Pressed Ctrl+C
- [ ] Typed `node server.js`
- [ ] See "Server running on..."
- [ ] Pressed Ctrl+Shift+R in browser
- [ ] Logged in as Teacher 81
- [ ] Opened Manual Attendance
- [ ] See 21 students

---

## Still Not Working?

### Check Server Terminal
Should see:
```
Server running on http://0.0.0.0:5000
```

### Check Browser Console (F12)
Should see:
```
Loaded students: 21
```

### Test API Directly
Open: http://localhost:5000/api/test

Should see:
```json
{"message": "API is working"}
```

---

## Login Credentials

**Teacher 81:**
- Tab: Staff (pink)
- Teacher ID: `81`
- Password: `password123`

**Admin:**
- Tab: Admin (orange)
- Admin ID: `admin`
- Password: `admin123`

---

## Expected Result

After restart, Manual Attendance should show:

```
📝 Manual Attendance

[Select Session ▼]
[Search 🔍] [Filter: All ▼]

[✓ Mark All Present] [✗ Mark All Absent] [⏰ Mark All Late]

┌─────────────────────────────────┐
│ 👤 Priya Sharma                 │
│    31 • MECH                    │
│    [Present ▼]                  │
├─────────────────────────────────┤
│ 👤 Student 1                    │
│    STU1000 • IT                 │
│    [Present ▼]                  │
├─────────────────────────────────┤
│ ... 19 more students ...        │
└─────────────────────────────────┘

Total: 21 | Present: 21 | Absent: 0
[💾 Save Attendance]
```

---

## Commands Reference

```bash
# Navigate to server
cd server

# Stop server
Ctrl+C

# Start server
node server.js

# Test server
curl http://localhost:5000/api/test

# Check students (in new terminal)
node testTeacher81API.js
```

---

**STATUS**: ⏳ Waiting for server restart

**NEXT**: Restart server → Refresh browser → Test Manual Attendance

**GOAL**: See 21 students in Manual Attendance ✓
