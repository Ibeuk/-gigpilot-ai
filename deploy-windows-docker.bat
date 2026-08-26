@echo off
title GigPilot AI — Windows Docker Production Launcher
color 0B

echo ========================================================
echo   🐳 GigPilot AI — 24/7 Docker Production Engine
echo ========================================================
echo.

:: Check Docker installation
docker --version >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not running on this Windows VPS.
    echo 💡 Use start-vps.bat instead for standard Node.js mode!
    pause
    exit /b 1
)

echo 📦 Building and starting 24/7 Docker production containers...
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

echo.
echo ========================================================
echo  ✅ GigPilot AI Docker Production Containers are LIVE 24/7!
echo ========================================================
echo  🌐 Dashboard Web App:    http://localhost
echo  📡 Active RSS 2.0 Feed:  http://localhost/rss/gigs.xml
echo ========================================================
echo.
pause
