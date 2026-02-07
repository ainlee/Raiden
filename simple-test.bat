@echo off
echo TEST START
cd /d "%~dp0"
echo DIR: %CD%

echo Testing Node...
node --version > test_output.txt 2>&1
type test_output.txt

echo Testing npm...
npm --version >> test_output.txt 2>&1
type test_output.txt

echo This window will stay open
pause
del test_output.txt