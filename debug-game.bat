@echo off
REM 終極中文支援版本
chcp 950 >nul 2>nul

title 雷電 STG 除錯模式

echo 雷電 STG 除錯模式
echo ==================
echo.

REM 獲取腳本目錄
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo 當前工作目錄: "%CD%"
echo.

REM 詳細環境檢查
echo [環境檢查]
echo ----------

echo 檢查 Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo   ❌ Node.js 未安裝或不在 PATH 中
) else (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do echo   ✅ Node.js: %%i
)

echo 檢查 npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo   ❌ npm 未安裝或不在 PATH 中
) else (
    for /f "tokens=*" %%i in ('npm --version 2^>nul') do echo   ✅ npm: %%i
)

echo.
echo [檔案檢查]
echo ----------
if exist "package.json" (
    echo   ✅ package.json 存在
) else (
    echo   ❌ package.json 不存在
)

if exist "node_modules" (
    echo   ✅ node_modules 存在
) else (
    echo   ❌ node_modules 不存在，需要安裝依賴
)

echo.
echo [網路檢查]
echo ----------
echo 檢查端口 22121 是否被占用...
netstat -an | findstr ":22121" >nul 2>&1
if errorlevel 1 (
    echo   ✅ 端口 22121 可用
) else (
    echo   ❌ 端口 22121 已被占用
)

echo.
echo [嘗試啟動]
echo ----------
echo 執行命令: npm run dev -- --port 22121
echo.

REM 嘗試啟動
npm run dev -- --port 22121

echo.
echo 除錯完成
echo ========================================
echo 如果上述過程中出現錯誤，
echo 請將完整輸出內容複製給開發人員
echo ========================================
echo.
pause