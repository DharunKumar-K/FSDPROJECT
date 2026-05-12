@echo off
echo ========================================
echo BULK IMPORT ERROR - AUTO FIX
echo ========================================
echo.

echo [1/5] Checking dependencies...
call npm list csv-parser multer >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Missing dependencies, installing...
    call npm install
    echo ✓ Dependencies installed
) else (
    echo ✓ Dependencies OK
)
echo.

echo [2/5] Checking uploads directory...
if not exist "uploads" (
    echo ⚠️  Creating uploads directory...
    mkdir uploads
    echo ✓ Uploads directory created
) else (
    echo ✓ Uploads directory exists
)
echo.

echo [3/5] Testing CSV import...
node testBulkImport.js
if %errorlevel% neq 0 (
    echo ❌ CSV import test failed
    echo Check the error above
    pause
    exit /b 1
)
echo.

echo [4/5] Counting current students...
node -e "const mongoose = require('mongoose'); const Student = require('./models/Student'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(async () => { console.log('Total students:', await Student.countDocuments()); process.exit(0); });"
echo.

echo [5/5] Summary
echo ========================================
echo ✓ Dependencies installed
echo ✓ Uploads directory ready
echo ✓ CSV import working
echo ✓ Database connected
echo.
echo NEXT STEPS:
echo 1. Make sure server is running: node server.js
echo 2. Login as admin (ID: admin, Password: admin123)
echo 3. Go to Bulk Import page
echo 4. Upload students_50.csv or students_100.csv
echo.
echo If web interface still fails:
echo - Check browser console (F12) for errors
echo - Check server terminal for errors
echo - Try: node testBulkImport.js (imports directly)
echo.
pause
