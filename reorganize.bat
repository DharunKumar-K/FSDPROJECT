@echo off
echo ========================================
echo REORGANIZING PROJECT STRUCTURE
echo ========================================
echo.
echo This will create separate frontend and backend folders.
echo.
echo Current structure:
echo   smart-attendance-system/
echo   ├── client/
echo   ├── server/
echo   └── docs/
echo.
echo New structure:
echo   smart-attendance-system/
echo   ├── frontend/  (renamed from client)
echo   ├── backend/   (renamed from server)
echo   └── docs/      (all documentation)
echo.
set /p confirm="Continue? (yes/no): "
if /i not "%confirm%"=="yes" (
    echo Cancelled.
    pause
    exit /b
)
echo.

cd c:\Users\Dharun Kumar\fsd\smart-attendance-system

echo [1/5] Renaming client to frontend...
if exist "client" (
    if exist "frontend" (
        echo Error: frontend folder already exists
        pause
        exit /b 1
    )
    ren client frontend
    echo ✓ Renamed client to frontend
) else (
    echo ⚠️  client folder not found
)
echo.

echo [2/5] Renaming server to backend...
if exist "server" (
    if exist "backend" (
        echo Error: backend folder already exists
        pause
        exit /b 1
    )
    ren server backend
    echo ✓ Renamed server to backend
) else (
    echo ⚠️  server folder not found
)
echo.

echo [3/5] Creating docs folder...
if not exist "docs" (
    mkdir docs
    echo ✓ Created docs folder
) else (
    echo ✓ docs folder already exists
)
echo.

echo [4/5] Moving documentation files to docs...
move /y *.md docs\ 2>nul
echo ✓ Moved documentation files
echo.

echo [5/5] Creating new README.md in root...
echo # Smart Attendance System > README.md
echo. >> README.md
echo A comprehensive attendance and curriculum activity management system. >> README.md
echo. >> README.md
echo ## Project Structure >> README.md
echo. >> README.md
echo - **frontend/** - React.js frontend application >> README.md
echo - **backend/** - Node.js/Express backend API >> README.md
echo - **docs/** - Complete documentation >> README.md
echo. >> README.md
echo ## Quick Start >> README.md
echo. >> README.md
echo ### Backend >> README.md
echo ```bash >> README.md
echo cd backend >> README.md
echo npm install >> README.md
echo node server.js >> README.md
echo ``` >> README.md
echo. >> README.md
echo ### Frontend >> README.md
echo ```bash >> README.md
echo cd frontend >> README.md
echo npm install >> README.md
echo npm start >> README.md
echo ``` >> README.md
echo. >> README.md
echo See **docs/** folder for complete documentation. >> README.md
echo ✓ Created new README.md
echo.

echo ========================================
echo REORGANIZATION COMPLETE!
echo ========================================
echo.
echo New structure:
echo   smart-attendance-system/
echo   ├── frontend/  (React app)
echo   ├── backend/   (Node.js API)
echo   ├── docs/      (Documentation)
echo   └── README.md  (Main readme)
echo.
echo IMPORTANT: Update import paths if needed!
echo.
pause
