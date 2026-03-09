@echo off
chcp 65001 >nul 2>nul

REM 取得目前腳本所在目錄
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM 載入 .env.local 環境變數
if exist ".env.local" (
    echo 載入 .env.local 環境變數...
    for /f "tokens=1,2 delims==" %%a in ('type .env.local ^| findstr /v "^#"') do (
        set "%%a=%%b"
    )
) else (
    echo 警告：未找到 .env.local 檔案
)

title GrminiRPG Dev Server

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
echo Starting GrminiRPG Dev Server...
echo ====================================
echo.

REM 取得專案根目錄的絕對路徑
set "PROJECT_ROOT=%SCRIPT_DIR%"

REM 使用簡單的方式啟動開發伺服器
start "GrminiRPG Dev Server" /D "%PROJECT_ROOT%" cmd /k "npm run dev && pause"

echo.
echo 開發伺服器啟動中...
echo 等待伺服器完全啟動...

REM 等待 8 秒讓伺服器完全啟動
timeout /t 8 /nobreak >nul

REM 自動開啟瀏覽器
echo 自動開啟瀏覽器...
start "" "http://localhost:22121/"

echo.
echo 開發伺服器已啟動！
echo 瀏覽器已自動開啟: http://localhost:22121/
echo.
pause

