@echo off
echo ========================================
echo AUTOMATED GITHUB CLEANUP
echo ========================================
echo.
echo This will delete large files to prepare for GitHub upload.
echo.
echo WARNING: This will delete:
echo   - All node_modules folders
echo   - All CSV files
echo   - All image files (png, svg, jpg)
echo   - Uploads folder
echo   - Build folders
echo.
set /p confirm="Are you sure? (yes/no): "
if /i not "%confirm%"=="yes" (
    echo Cancelled.
    pause
    exit /b
)
echo.

cd c:\Users\Dharun Kumar\fsd\smart-attendance-system

echo [1/6] Deleting node_modules...
if exist "client\node_modules" (
    echo Deleting client\node_modules...
    rmdir /s /q "client\node_modules"
    echo ✓ Deleted client\node_modules
)
if exist "server\node_modules" (
    echo Deleting server\node_modules...
    rmdir /s /q "server\node_modules"
    echo ✓ Deleted server\node_modules
)
if exist "ai\node_modules" (
    echo Deleting ai\node_modules...
    rmdir /s /q "ai\node_modules"
    echo ✓ Deleted ai\node_modules
)
echo.

echo [2/6] Deleting CSV files...
del /s /q *.csv 2>nul
echo ✓ Deleted CSV files
echo.

echo [3/6] Deleting image files...
del /q *.png *.svg *.jpg *.jpeg *.gif 2>nul
echo ✓ Deleted image files
echo.

echo [4/6] Deleting uploads folder...
if exist "server\uploads" (
    rmdir /s /q "server\uploads"
    echo ✓ Deleted uploads folder
)
echo.

echo [5/6] Deleting build folders...
if exist "client\build" (
    rmdir /s /q "client\build"
    echo ✓ Deleted client\build
)
echo.

echo [6/6] Deleting large documents...
del /q *.docx *.pdf *.pptx 2>nul
echo ✓ Deleted documents
echo.

echo ========================================
echo CLEANUP COMPLETE!
echo ========================================
echo.
echo Your project is now ready for GitHub.
echo.
echo NEXT STEPS:
echo.
echo 1. Initialize git (if not already):
echo    git init
echo.
echo 2. Add all files:
echo    git add .
echo.
echo 3. Commit:
echo    git commit -m "Initial commit: Smart Attendance System"
echo.
echo 4. Create repository on GitHub, then:
echo    git branch -M main
echo    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo    git push -u origin main
echo.
echo 5. After cloning, others should run:
echo    cd client ^&^& npm install
echo    cd server ^&^& npm install
echo.
pause
