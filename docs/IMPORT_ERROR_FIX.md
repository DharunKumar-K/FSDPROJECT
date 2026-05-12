# 🔧 BULK IMPORT ERROR - TROUBLESHOOTING GUIDE

## Common Import Errors & Solutions

### Error 1: "Cannot find module 'csv-parser'"
**Solution:**
```bash
cd server
npm install csv-parser multer
node server.js
```

### Error 2: "ENOENT: no such file or directory, open 'uploads/...'"
**Solution:**
```bash
cd server
mkdir uploads
node server.js
```

### Error 3: "Unauthorized" or 401 Error
**Solution:**
- Logout and login again as admin
- Make sure you're logged in as admin (not teacher/student)
- Check token is valid

### Error 4: "Forbidden" or 403 Error
**Solution:**
- Only admins can import students
- Login as admin (ID: admin, Password: admin123)

### Error 5: "File too large"
**Solution:**
- File must be under 5MB
- Split large files into smaller batches
- Use students_50.csv or students_100.csv for testing

### Error 6: "Invalid file format"
**Solution:**
- Only CSV, XLSX, XLS files are supported
- Make sure file has .csv extension
- Open in Notepad to verify it's plain text CSV

### Error 7: "Duplicate registerNo or email"
**Solution:**
- Delete existing students first:
  ```bash
  cd server
  node deleteAllStudents.js
  ```
- Or use different register numbers/emails

### Error 8: "Missing required fields"
**Solution:**
- Check CSV has all 7 columns:
  - name, registerNo, email, password, department, year, semester
- No empty values allowed
- Check for extra commas or missing commas

---

## Quick Fix Steps

### Step 1: Verify Dependencies
```bash
cd server
npm list csv-parser multer
```

Should show:
```
├── csv-parser@3.0.0
└── multer@1.4.5-lts.2
```

If not:
```bash
npm install
```

### Step 2: Verify Uploads Directory
```bash
cd server
dir uploads
```

If error:
```bash
mkdir uploads
```

### Step 3: Restart Server
```bash
cd server
# Press Ctrl+C
node server.js
```

### Step 4: Test Import via Script
```bash
cd server
node testBulkImport.js
```

Should show:
```
✓ Success: 50
❌ Failed: 0
```

### Step 5: Test via Web Interface
1. Login as admin
2. Go to Bulk Import
3. Upload students_50.csv
4. Check results

---

## Detailed Error Messages

### "Error importing data"
**Possible causes:**
1. Server not running
2. Wrong API endpoint
3. Network error
4. File upload failed

**Debug steps:**
1. Check browser console (F12)
2. Check Network tab for failed requests
3. Check server terminal for errors
4. Verify server is running on port 5000

### "Import failed"
**Possible causes:**
1. Invalid CSV format
2. Missing required fields
3. Duplicate data
4. Database connection error

**Debug steps:**
1. Check import results for specific errors
2. Verify CSV format
3. Check server logs
4. Test with testBulkImport.js script

### No error but students not showing
**Possible causes:**
1. Import succeeded but UI not refreshed
2. Viewing wrong page
3. Filter applied

**Debug steps:**
1. Refresh the page
2. Go to Students page
3. Clear any filters
4. Check total count

---

## Testing Checklist

Before uploading via web interface:

- [ ] Server is running (`node server.js`)
- [ ] Dependencies installed (`npm install`)
- [ ] Uploads directory exists
- [ ] Logged in as admin
- [ ] CSV file is valid format
- [ ] CSV has all required columns
- [ ] No duplicate registerNo or email
- [ ] File size under 5MB

---

## Manual Import (If Web Interface Fails)

Use the test script to import directly:

```bash
cd server
node testBulkImport.js
```

This bypasses the web interface and imports directly to database.

---

## Verify Import Success

### Check Database
```bash
cd server
node -e "
const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const count = await Student.countDocuments();
  console.log('Total students:', count);
  const students = await Student.find({}, 'name registerNo').limit(10);
  students.forEach(s => console.log(s.registerNo, s.name));
  process.exit(0);
});
"
```

### Check via Admin Dashboard
1. Login as admin
2. Go to Students page
3. Should see all imported students
4. Check total count matches

---

## Common CSV Format Issues

### Issue 1: Wrong Column Order
❌ Wrong:
```csv
registerNo,name,email,password,department,year,semester
```

✓ Correct:
```csv
name,registerNo,email,password,department,year,semester
```

### Issue 2: Missing Header Row
❌ Wrong:
```csv
John Doe,2021001,john@college.edu,password123,CSE,1,1
```

✓ Correct:
```csv
name,registerNo,email,password,department,year,semester
John Doe,2021001,john@college.edu,password123,CSE,1,1
```

### Issue 3: Extra Commas
❌ Wrong:
```csv
name,registerNo,email,password,department,year,semester,
John Doe,2021001,john@college.edu,password123,CSE,1,1,
```

✓ Correct:
```csv
name,registerNo,email,password,department,year,semester
John Doe,2021001,john@college.edu,password123,CSE,1,1
```

### Issue 4: Quotes in Data
❌ Wrong:
```csv
name,registerNo,email,password,department,year,semester
"John Doe",2021001,john@college.edu,password123,CSE,1,1
```

✓ Correct:
```csv
name,registerNo,email,password,department,year,semester
John Doe,2021001,john@college.edu,password123,CSE,1,1
```

---

## Browser Console Errors

### Check Browser Console (F12)

**Look for:**
- Red error messages
- Failed network requests
- 401/403/500 status codes

**Common errors:**
- `Failed to fetch` - Server not running
- `401 Unauthorized` - Not logged in or token expired
- `403 Forbidden` - Not admin role
- `500 Internal Server Error` - Server-side error

---

## Server Console Errors

### Check Server Terminal

**Look for:**
- Error messages
- Stack traces
- Failed requests

**Common errors:**
- `Cannot find module` - Missing dependencies
- `ENOENT` - File/directory not found
- `MongoError` - Database error
- `ValidationError` - Invalid data

---

## Step-by-Step Debug Process

### 1. Test CSV File
```bash
cd server
node testBulkImport.js
```

If this works, CSV is valid and database is working.

### 2. Test API Endpoint
```bash
# In browser, open DevTools (F12)
# Go to Network tab
# Try uploading via web interface
# Check the request to /api/bulk-import-students
# Look at request headers, body, and response
```

### 3. Check Authentication
```javascript
// In browser console
console.log(JSON.parse(localStorage.getItem('user')));
// Should show: { token: "...", role: "admin", ... }
```

### 4. Check Server Logs
```bash
# In server terminal
# Should see:
POST /api/bulk-import-students 200
# Or error message if failed
```

---

## Quick Commands

### Install Dependencies
```bash
cd server
npm install
```

### Create Uploads Directory
```bash
cd server
mkdir uploads
```

### Delete All Students
```bash
cd server
node deleteAllStudents.js
```

### Test Import
```bash
cd server
node testBulkImport.js
```

### Count Students
```bash
cd server
node -e "
const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Total students:', await Student.countDocuments());
  process.exit(0);
});
"
```

### Restart Server
```bash
cd server
# Press Ctrl+C
node server.js
```

---

## If All Else Fails

### Nuclear Option: Complete Reset

```bash
# 1. Stop all servers
# Press Ctrl+C in all terminals

# 2. Delete node_modules and reinstall
cd server
rmdir /s /q node_modules
npm install

# 3. Delete all students
node deleteAllStudents.js

# 4. Test import via script
node testBulkImport.js

# 5. Restart server
node server.js

# 6. Test via web interface
# Login as admin
# Upload students_50.csv
```

---

## Contact Information

If you're still getting errors, provide:
1. Exact error message
2. Browser console screenshot (F12)
3. Server terminal output
4. Steps you've tried

---

## Summary

**Most common issues:**
1. ✅ Server not restarted
2. ✅ Missing dependencies
3. ✅ Not logged in as admin
4. ✅ Invalid CSV format
5. ✅ Duplicate data

**Quick fix:**
```bash
cd server
npm install
mkdir uploads
node deleteAllStudents.js
node testBulkImport.js
node server.js
```

Then upload via web interface.
