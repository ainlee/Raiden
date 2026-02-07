@echo off
echo Testing environment...
cd /d "%~dp0"

echo Current directory: %CD%
echo.

echo Checking Node.js...
node --version
if errorlevel 1 (
    echo Node.js not found!
    pause
    exit
)

echo Checking npm...
npm --version
if errorlevel 1 (
    echo npm not found!
    pause
    exit
)

echo Checking package.json...
if exist package.json (
    echo package.json found
) else (
    echo package.json NOT found!
    pause
    exit
)

echo Checking node_modules...
if exist node_modules (
    echo node_modules found
) else (
    echo Installing dependencies...
    npm install
)

echo.
echo Starting dev server...
npm run dev

pause