@echo off
REM 設定為繁體中文
chcp 950 >nul 2>&1

title 雷電 STG 啟動器 - 永不關閉版

REM 建立時間戳記和 LOG 檔案
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set "LOG_FILE=%~dp0raiden_log_%datetime:~0,8%_%datetime:~8,6%.txt"

REM 強制寫入開始標記到 LOG
echo ===================================== > "%LOG_FILE%"
echo 雷電 STG 啟動日誌 >> "%LOG_FILE%"
echo 時間: %date% %time% >> "%LOG_FILE%"
echo ===================================== >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

:main_loop
echo.
echo ╔══════════════════════════════════════╗
echo ║     雷電 STG 遊戲啟動器 v2.0       ║
echo ║    LOG檔: raiden_log_*.txt          ║
echo ╚══════════════════════════════════════╝
echo.

REM 記錄到 LOG
echo 開始啟動程序... >> "%LOG_FILE%"

REM 切換到正確目錄
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%" 2>&1
echo 切換到目錄: %CD% >> "%LOG_FILE%"
echo 當前目錄: "%CD%"

REM 檢查基本檔案
echo.
echo [檢查] 基本檔案...
echo 檢查基本檔案... >> "%LOG_FILE%"

if exist "package.json" (
    echo   ✅ package.json 存在
    echo   package.json 存在 >> "%LOG_FILE%"
) else (
    echo   ❌ package.json 不存在
    echo   package.json 不存在 >> "%LOG_FILE%"
    goto :error_section
)

REM 檢查 Node.js
echo.
echo [檢查] Node.js...
echo 檢查 Node.js... >> "%LOG_FILE%"

node --version > temp_node.txt 2>&1
set NODE_RESULT=%errorlevel%
type temp_node.txt >> "%LOG_FILE%"

if %NODE_RESULT% equ 0 (
    for /f "tokens=*" %%i in (temp_node.txt) do echo   ✅ Node.js: %%i
) else (
    echo   ❌ Node.js 錯誤
    echo   Node.js 錯誤 >> "%LOG_FILE%"
    type temp_node.txt >> "%LOG_FILE%"
    goto :error_section
)

REM 檢查 npm
echo.
echo [檢查] npm...
echo 檢查 npm... >> "%LOG_FILE%"

npm --version > temp_npm.txt 2>&1
set NPM_RESULT=%errorlevel%
type temp_npm.txt >> "%LOG_FILE%"

if %NPM_RESULT% equ 0 (
    for /f "tokens=*" %%i in (temp_npm.txt) do echo   ✅ npm: %%i
) else (
    echo   ❌ npm 錯誤
    echo   npm 錯誤 >> "%LOG_FILE%"
    type temp_npm.txt >> "%LOG_FILE%"
    goto :error_section
)

REM 檢查依賴
echo.
echo [檢查] 依賴套件...
echo 檢查依賴套件... >> "%LOG_FILE%"

if exist "node_modules" (
    echo   ✅ node_modules 已存在
    echo   node_modules 已存在 >> "%LOG_FILE%"
) else (
    echo   📦 安裝依賴中...
    echo   安裝依賴中... >> "%LOG_FILE%"
    
    call npm install > temp_install.txt 2>&1
    set INSTALL_RESULT=%errorlevel%
    type temp_install.txt >> "%LOG_FILE%"
    
    if %INSTALL_RESULT% equ 0 (
        echo   ✅ 依賴安裝完成
        echo   依賴安裝完成 >> "%LOG_FILE%"
    ) else (
        echo   ❌ 依賴安裝失敗
        echo   依賴安裝失敗 >> "%LOG_FILE%"
        goto :error_section
    )
)

REM 嘗試啟動伺服器
echo.
echo [啟動] 開發伺服器...
echo 啟動開發伺服器... >> "%LOG_FILE%"

echo   嘗試端口 22121...
echo   嘗試端口 22121... >> "%LOG_FILE%"

call npm run dev -- --port 22121 > temp_server.txt 2>&1
set SERVER_RESULT=%errorlevel%
type temp_server.txt >> "%LOG_FILE%"

if %SERVER_RESULT% equ 0 (
    echo.
    echo ========================================
    echo ✅ 遊戲伺服器已啟動！
    echo    瀏覽器位址: http://localhost:22121
    echo ========================================
    echo.
    echo 伺服器啟動成功！ >> "%LOG_FILE%"
    
    REM 等待幾秒後開啟瀏覽器
    timeout /t 3 /nobreak >nul 2>&1
    echo 正在開啟瀏覽器...
    start "" "http://localhost:22121" 2>> "%LOG_FILE%"
    
    echo 按任意鍵重新啟動，或按 Ctrl+C 退出...
    echo 按任意鍵重新啟動，或按 Ctrl+C 退出... >> "%LOG_FILE%"
    pause >nul 2>&1
    goto :main_loop
) else (
    echo.
    echo   ❌ 端口 22121 啟動失敗
    echo   嘗試默認端口...
    echo   端口 22121 啟動失敗，嘗試默認端口... >> "%LOG_FILE%"
    
    call npm run dev > temp_server2.txt 2>&1
    set SERVER2_RESULT=%errorlevel%
    type temp_server2.txt >> "%LOG_FILE%"
    
    if %SERVER2_RESULT% equ 0 (
        echo.
        echo ========================================
        echo ✅ 遊戲伺服器已啟動！
        echo    瀏覽器位址: http://localhost:5173
        echo ========================================
        echo.
        echo 伺服器啟動成功（默認端口）！ >> "%LOG_FILE%"
        
        timeout /t 3 /nobreak >nul 2>&1
        echo 正在開啟瀏覽器...
        start "" "http://localhost:5173" 2>> "%LOG_FILE%"
        
        echo 按任意鍵重新啟動，或按 Ctrl+C 退出...
        pause >nul 2>&1
        goto :main_loop
    ) else (
        goto :error_section
    )
)

:error_section
echo.
echo ========================================
echo ❌ 發生錯誤！
echo LOG 檔案位址: %LOG_FILE%
echo ========================================
echo.
echo 請查看 LOG 檔案了解詳細錯誤信息
echo.
echo 選項:
echo [R] 重新嘗試
echo [V] 查看 LOG 檔案
echo [Q] 退出
echo.

choice /c RVQ /n /m "請選擇: "
if errorlevel 3 goto :quit
if errorlevel 2 goto :view_log
if errorlevel 1 goto :retry

:retry
echo 重新嘗試... >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"
goto :main_loop

:view_log
echo.
echo === LOG 檔案內容 ===
type "%LOG_FILE%"
echo.
echo ====================
echo.
pause
goto :main_loop

:quit
echo.
echo 感謝使用雷電 STG 啟動器
echo LOG 檔案已儲存: %LOG_FILE%
echo.
timeout /t 2 >nul 2>&1
exit

REM 清理暫存檔（如果程式正常結束）
del temp_*.txt >nul 2>&1