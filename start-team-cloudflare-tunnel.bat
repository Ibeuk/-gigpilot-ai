@echo off
title GigPilot AI — Team Cloudflare Tunnel Launcher
color 0B

echo ========================================================
echo   🌐 GigPilot AI — Team Sharing via Cloudflare Tunnel
echo ========================================================
echo.

:: 1. Check if cloudflared.exe exists in current directory or PATH
where cloudflared >nul 2>nul
if %errorlevel% equ 0 (
    set CLOUDFLARED_CMD=cloudflared
) else if exist "%~dp0cloudflared.exe" (
    set CLOUDFLARED_CMD="%~dp0cloudflared.exe"
) else (
    echo 📥 Downloading Cloudflare Tunnel Client (cloudflared)...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile '%~dp0cloudflared.exe'"
    if not exist "%~dp0cloudflared.exe" (
        echo ❌ Failed to download cloudflared.exe automatically.
        echo Please download it manually from https://github.com/cloudflare/cloudflared/releases
        pause
        exit /b 1
    )
    set CLOUDFLARED_CMD="%~dp0cloudflared.exe"
    echo ✅ Cloudflare client ready!
)

echo.
echo ========================================================
echo  🚀 Starting Secure Team Tunnel (Connecting to http://localhost:3000)...
echo ========================================================
echo  💡 Copy the public https://xxxx.trycloudflare.com link below
echo     and share it with your team members!
echo ========================================================
echo.

%CLOUDFLARED_CMD% tunnel --url http://localhost:3000

pause
