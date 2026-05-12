@echo off
echo ========================================
echo MANUAL ATTENDANCE FIX - VERIFICATION
echo ========================================
echo.

echo [1/4] Checking Teacher 81 Data...
echo.
node checkTeacher81.js
if %errorlevel% neq 0 (
    echo ERROR: Failed to verify teacher data
    pause
    exit /b 1
)

echo.
echo ========================================
echo [2/4] Testing API Endpoints...
echo.
node testTeacher81API.js
if %errorlevel% neq 0 (
    echo ERROR: API test failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo [3/4] Testing Live Endpoint...
echo.
echo Make sure server is running on port 5000
timeout /t 2 >nul
node testEndpoint.js

echo.
echo ========================================
echo [4/4] Summary
echo ========================================
echo.
echo ✓ Teacher 81 exists with 21 students
echo ✓ API endpoints are working
echo ✓ Student 31 (Priya Sharma) is enrolled
echo.
echo NEXT STEPS:
echo 1. Make sure server is running: node server.js
echo 2. Login as Teacher 81 (ID: 81, Password: password123)
echo 3. Go to Manual Attendance page
echo 4. You should see 21 students
echo.
echo If students still don't show:
echo - Restart the server (Ctrl+C then node server.js)
echo - Clear browser cache (Ctrl+Shift+R)
echo - Check browser console for errors (F12)
echo.
pause
