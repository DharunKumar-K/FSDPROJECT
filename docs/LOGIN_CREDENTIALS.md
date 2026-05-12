# 🎯 QUICK LOGIN REFERENCE

## All Login Credentials

### 🔐 Admin Account
```
Login URL: http://localhost:3000/login
Tab: Admin (orange)
Admin ID: admin
Password: admin123
Email: admin@college.edu
```

**Access to:**
- All students management
- Bulk import students
- Manual attendance for all
- System statistics
- Department analytics

---

### 👨‍🏫 Teacher Account (Staff ID 81)
```
Login URL: http://localhost:3000/login
Tab: Staff (pink)
Teacher ID: 81
Password: password123
Email: dharunkumar.k2024aids@sece.ac.in
```

**Access to:**
- 21 enrolled students
- 5 courses (CS300-CS304)
- Manual attendance
- Create activities
- View submissions
- Attendance tracking

---

### 👨‍🎓 Student Account (Register No 31)
```
Login URL: http://localhost:3000/login
Tab: Student (blue)
Register No: 31
Password: password123
Email: student31@college.edu
Name: Priya Sharma
Department: MECH
Year: 2
Semester: 8
```

**Access to:**
- Personal dashboard
- Attendance records
- Activities and submissions
- Performance metrics
- Course information

---

## Quick Test Commands

### Verify All Accounts
```bash
cd server
node quickCheck.js
```

### Create/Verify Admin
```bash
cd server
node createAdmin.js
```

### Check Teacher 81 Data
```bash
cd server
node checkTeacher81.js
```

---

## Login Page Tabs

When you open http://localhost:3000/login, you'll see:

```
┌─────────────────────────────────────┐
│  [Student] [Staff] [Admin]          │
│                                     │
│  Admin ID: _____________________    │
│  Password: _____________________    │
│                                     │
│  [Authenticate & Proceed]           │
└─────────────────────────────────────┘
```

- **Blue tab** = Student login (use Register No)
- **Pink tab** = Staff/Teacher login (use Teacher ID)
- **Orange tab** = Admin login (use Admin ID)

---

## What Each Role Can Do

### Admin
✓ View ALL students (currently 21)
✓ Add/Delete students
✓ Bulk import from CSV/Excel
✓ Mark attendance for anyone
✓ View all teachers
✓ System-wide statistics

### Teacher (ID 81)
✓ View enrolled students (21 students)
✓ View courses (5 courses)
✓ Mark attendance for enrolled students
✓ Create activities
✓ Grade submissions
✓ View course statistics

### Student (ID 31)
✓ View personal attendance
✓ Submit activities
✓ View grades
✓ Track performance
✓ View course information

---

## Common Issues & Solutions

### "Invalid credentials"
- Check you selected the correct tab (Admin/Staff/Student)
- Admin uses `admin` not email
- Teacher uses `81` not email
- Student uses `31` not email

### "Admin tab not showing"
- Restart React dev server
- Clear browser cache (Ctrl+Shift+R)
- Check Login.js was updated

### "No students showing for teacher"
- Restart backend server
- Run: `node quickCheck.js`
- Clear browser cache

### "Admin account doesn't exist"
```bash
cd server
node createAdmin.js
```

---

## File Locations

- **Admin Creation**: `server/createAdmin.js`
- **Login Component**: `client/src/components/auth/Login.js`
- **Admin Controller**: `server/controllers/adminController.js`
- **Admin Model**: `server/models/Admin.js`

---

## Next Steps

1. ✅ Admin account created
2. ✅ Login page updated with Admin tab
3. ✅ Teacher 81 has 21 students
4. ✅ Student 31 enrolled in 5 courses
5. ⏳ **Restart servers** (backend + frontend)
6. ⏳ **Test all three logins**

---

## Restart Commands

### Backend Server
```bash
cd server
# Press Ctrl+C to stop
node server.js
```

### Frontend Server
```bash
cd client
# Press Ctrl+C to stop
npm start
```

---

**TL;DR**: 
- Admin: `admin` / `admin123` (orange tab)
- Teacher: `81` / `password123` (pink tab)
- Student: `31` / `password123` (blue tab)

All at: http://localhost:3000/login
