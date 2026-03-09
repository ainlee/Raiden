@echo off
chcp 65001 >nul 2>nul

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

title Raiden STG Launcher

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo ====================================
echo Raiden STG Game Launcher
echo ====================================
echo.

echo Starting development server...
echo.

start "Raiden STG Dev Server" cmd /k "npm run dev -- --port 22121"

echo Waiting for server to start...
timeout /t 8 /nobreak >nul

echo Opening browser...
start "" "http://localhost:22121"

echo.
echo Game started!
echo Browser URL: http://localhost:22121
echo.
echo Server window will stay open. Press Ctrl+C to stop.
echo.
pause
