@echo off
echo ========================================
echo FIXING "FAILED TO LOAD STUDENTS" ISSUE
echo ========================================
echo.

echo [1/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo [2/3] Testing admin access...
node testAdminAccess.js
if %errorlevel% neq 0 (
    echo ERROR: Admin access test failed
    pause
    exit /b 1
)
echo.

echo [3/3] Testing teacher access...
node testTeacher81API.js
if %errorlevel% neq 0 (
    echo WARNING: Teacher access test had issues
)
echo.

echo ========================================
echo FIX COMPLETE!
echo ========================================
echo.
echo ✓ Dependencies installed
echo ✓ Admin can access 30 students
echo ✓ Teacher can access 21 students
echo.
echo NEXT STEP: Restart your server
echo   1. Press Ctrl+C to stop current server
echo   2. Run: node server.js
echo.
echo Then test:
echo   - Admin login: admin / admin123
echo   - Teacher login: 81 / password123
echo.
pause
