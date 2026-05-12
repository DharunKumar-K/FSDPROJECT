# 🔐 ADMIN LOGIN GUIDE

## Admin Account Created ✓

An admin account has been created in your database.

## Login Credentials

```
Admin ID: admin
Password: admin123
Email: admin@college.edu
```

## How to Access Admin Login

### Step 1: Go to Login Page
Open your browser and navigate to:
```
http://localhost:3000/login
```

### Step 2: Select Admin Portal
You'll see three tabs at the top:
- **Student** (blue)
- **Staff** (pink)
- **Admin** (orange) ← Click this one

### Step 3: Enter Credentials
- **Admin ID**: `admin`
- **Password**: `admin123`

### Step 4: Click "Authenticate & Proceed"

## What You Can Do as Admin

### 1. View All Students
- Navigate to `/students` or click "Students" in dashboard
- See complete list of all students in the system
- Search and filter by department
- View student details

### 2. Manage Students
- Add new students manually
- Delete students
- View student information
- See department statistics

### 3. Bulk Import Students
- Navigate to `/bulk-import`
- Upload CSV/Excel files with student data
- Import up to 1000 students at once
- Download CSV template
- See import results and errors

### 4. Manual Attendance
- Navigate to `/manual-attendance`
- Mark attendance for all students
- Bulk operations (mark all present/absent/late)
- Select sessions
- View existing attendance

### 5. View System Data
- Total students count
- Department distribution
- System statistics

## Admin Dashboard Features

After logging in, you'll have access to:

✓ **Student Management** - View, add, delete students
✓ **Bulk Import** - Upload student data from CSV/Excel
✓ **Manual Attendance** - Mark attendance for multiple students
✓ **System Overview** - Statistics and charts
✓ **Department Analytics** - Student distribution by department

## API Endpoints for Admin

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/login` | POST | Admin login |
| `/api/students` | GET | Get all students |
| `/api/students` | POST | Add new student |
| `/api/students/:id` | DELETE | Delete student |
| `/api/bulk-import-students` | POST | Bulk import students |
| `/api/teachers` | GET | Get all teachers |
| `/api/mark-bulk-attendance` | POST | Mark bulk attendance |

## Testing Admin Access

### Quick Test
```bash
cd server
node createAdmin.js
```

This will show you the admin credentials.

### Verify Admin Exists
```bash
cd server
node -e "
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const admin = await Admin.findOne({ adminId: 'admin' });
  console.log('Admin exists:', !!admin);
  if (admin) {
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Admin ID:', admin.adminId);
  }
  process.exit(0);
});
"
```

## Troubleshooting

### Issue: Don't see Admin tab on login page
**Solution**: 
1. Make sure you've updated the Login.js file
2. Restart your React development server
3. Clear browser cache (Ctrl+Shift+R)

### Issue: Invalid credentials
**Solution**:
1. Make sure you're using `admin` (lowercase) as Admin ID
2. Password is `admin123`
3. Make sure you selected the "Admin" tab (not Student or Staff)

### Issue: Admin account doesn't exist
**Solution**:
```bash
cd server
node createAdmin.js
```

### Issue: 404 error on /api/admin/login
**Solution**:
1. Make sure server is running
2. Check server logs for errors
3. Verify adminRoutes.js is properly configured

## Creating Additional Admin Accounts

You can create more admin accounts by modifying `createAdmin.js`:

```javascript
const admin = new Admin({
    name: 'Another Admin',
    adminId: 'admin2',
    email: 'admin2@college.edu',
    password: 'password123',
    institutionType: 'college',
    role: 'admin'
});
```

Or use the register endpoint:
```bash
POST /api/admin/register
{
  "name": "New Admin",
  "adminId": "admin2",
  "email": "admin2@college.edu",
  "password": "password123",
  "institutionType": "college"
}
```

## Security Notes

⚠️ **Important**: Change the default admin password in production!

To change password:
1. Login as admin
2. Use a password change endpoint (if implemented)
3. Or manually update in database with hashed password

## Summary

**Login URL**: http://localhost:3000/login

**Credentials**:
- Admin ID: `admin`
- Password: `admin123`

**Steps**:
1. Click "Admin" tab (orange)
2. Enter credentials
3. Click "Authenticate & Proceed"
4. Access admin dashboard

---

**All Accounts Summary**:

| Role | ID | Password | Email |
|------|-----|----------|-------|
| Admin | admin | admin123 | admin@college.edu |
| Teacher | 81 | password123 | dharunkumar.k2024aids@sece.ac.in |
| Student | 31 | password123 | student31@college.edu |

---

**Status**: ✅ Admin account created and login page updated. Ready to use!
