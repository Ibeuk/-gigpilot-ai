@echo off
title GigPilot AI 24/7 Windows VPS Launcher
color 0A

echo ========================================================
echo   🚀 GigPilot AI — 24/7 Windows VPS Auto-Launcher
echo ========================================================
echo.

:: 1. Verify Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed or not found in PATH!
    echo Please download and install Node.js (v18 or v20) from https://nodejs.org
    pause
    exit /b 1
)

:: 2. Backend setup and 24/7 launch
echo 📦 [1/2] Setting up NestJS Backend & Auto-Pinger Engine (Port 3001)...
cd /d "%~dp0backend"
if not exist node_modules (
    echo Installing backend packages...
    call npm install
)

echo Launching 24/7 Backend Service...
start "GigPilot-Backend-Engine" cmd /k "title GigPilot Backend Engine (Port 3001) && npm run start:dev"

:: 3. Frontend setup and 24/7 launch
timeout /t 5 >nul
echo 🌐 [2/2] Setting up Next.js Dashboard Frontend (Port 3000)...
cd /d "%~dp0frontend"
if not exist node_modules (
    echo Installing frontend packages...
    call npm install
)

echo Launching 24/7 Frontend Web Service...
start "GigPilot-Frontend-Dashboard" cmd /k "title GigPilot Frontend Dashboard (Port 3000) && npm run dev"

cd /d "%~dp0"

echo.
echo ========================================================
echo  ✅ GigPilot AI 24/7 Engine is ACTIVE on your Windows VPS!
echo ========================================================
echo.
echo  🌐 Dashboard Web App:    http://localhost:3000
echo  📡 Active RSS 2.0 Feed:  http://localhost:3001/rss/gigs.xml
echo  📖 Interactive API Docs: http://localhost:3001/api/docs
echo.
echo  💡 TIP FOR WINDOWS VPS:
echo  - You can minimize the command prompt windows.
echo  - They will keep running continuously 24/7 in the background!
echo ========================================================
echo.
pause
