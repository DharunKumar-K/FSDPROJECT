@echo off
echo ========================================
echo GITHUB UPLOAD PREPARATION
echo ========================================
echo.

echo [1/5] Checking folder sizes...
echo.

cd c:\Users\Dharun Kumar\fsd\smart-attendance-system

echo Checking node_modules...
if exist "node_modules" (
    echo ⚠️  Root node_modules found
)
if exist "client\node_modules" (
    echo ⚠️  Client node_modules found
)
if exist "server\node_modules" (
    echo ⚠️  Server node_modules found
)
if exist "ai\node_modules" (
    echo ⚠️  AI node_modules found
)
echo.

echo [2/5] Checking for large files...
echo.
dir /s /b *.png *.jpg *.jpeg *.svg *.docx *.pdf 2>nul | find /c /v ""
echo image/document files found
echo.

echo [3/5] Checking CSV files...
echo.
dir /s /b *.csv 2>nul
echo.

echo [4/5] Checking uploads folder...
echo.
if exist "server\uploads" (
    dir "server\uploads" /s
) else (
    echo ✓ No uploads folder
)
echo.

echo [5/5] Recommendations...
echo.
echo ========================================
echo TO REDUCE SIZE:
echo ========================================
echo.
echo 1. Delete node_modules (will be reinstalled):
echo    rmdir /s /q client\node_modules
echo    rmdir /s /q server\node_modules
echo    rmdir /s /q ai\node_modules
echo.
echo 2. Delete CSV exports:
echo    del /q server\*.csv
echo.
echo 3. Delete image files (optional):
echo    del /q *.png *.svg *.jpg
echo.
echo 4. Delete uploads:
echo    rmdir /s /q server\uploads
echo.
echo ========================================
echo AFTER CLEANUP, RUN:
echo ========================================
echo.
echo git init
echo git add .
echo git commit -m "Initial commit"
echo git branch -M main
echo git remote add origin YOUR_GITHUB_URL
echo git push -u origin main
echo.
pause
