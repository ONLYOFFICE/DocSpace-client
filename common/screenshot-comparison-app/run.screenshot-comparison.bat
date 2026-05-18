@echo OFF
setlocal enabledelayedexpansion
REM Screenshot Comparison App Runner for Windows
REM This script installs dependencies and runs the screenshot comparison tool
REM Usage: run.screenshot-comparison.bat

echo Starting Screenshot Comparison App...
echo.

REM Check if node is installed
node -v > nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js could not be found.
    echo Please install Node.js from https://nodejs.org/
    start https://nodejs.org/en/download/
    exit /b 1
)

REM Set paths
set SCRIPT_DIR=%~dp0

cd /d "%SCRIPT_DIR%"

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies.
    exit /b 1
)

echo.
echo Launching screenshot comparison tool...
call npm run compare
