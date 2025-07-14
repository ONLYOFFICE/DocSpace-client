@echo OFF
setlocal enabledelayedexpansion
REM Translation App Runner for Windows
REM This script runs both the backend and frontend of the translation app

echo Starting Translation App...
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
set ROOT_DIR=%~dp0
set BACKEND_DIR=%ROOT_DIR%backend
set FRONTEND_DIR=%ROOT_DIR%frontend

REM Store process IDs for cleanup
set BACKEND_PID=0
set FRONTEND_PID=0

echo Installing backend dependencies...
cd /d "%BACKEND_DIR%"
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies.
    exit /b 1
)

echo Installing frontend dependencies...
cd /d "%FRONTEND_DIR%"
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies.
    exit /b 1
)

echo Running scripts...
cd /d "%BACKEND_DIR%"

call npm run generate-metadata
if %errorlevel% neq 0 (
    echo Failed to run generate-metadata.
    exit /b 1
)

call npm run save-meta-keys-usage
if %errorlevel% neq 0 (
    echo Failed to run save-meta-keys-usage.
    exit /b 1
)

call npm run generate-auto-comments-metadata
if %errorlevel% neq 0 (
    echo Failed to run generate-auto-comments-metadata.
    exit /b 1
)

echo.
echo Starting backend server...
start /b cmd /c "cd /d "%BACKEND_DIR%" && npm run dev > backend.log 2>&1"
REM Get the PID of the most recently started process
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq node.exe" /fo list ^| findstr "PID:"') do (
    set BACKEND_PID=%%a
    goto :backend_pid_found
)
:backend_pid_found
echo Backend server started with PID: %BACKEND_PID%

echo Starting frontend server...
start /b cmd /c "cd /d "%FRONTEND_DIR%" && npm run dev > frontend.log 2>&1"
REM Get the PID of the most recently started process
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq node.exe" /fo list ^| findstr "PID:"') do (
    if not %%a==%BACKEND_PID% (
        set FRONTEND_PID=%%a
        goto :frontend_pid_found
    )
)
:frontend_pid_found
echo Frontend server started with PID: %FRONTEND_PID%

echo.
echo Translation App is starting...
echo Backend will be available at http://localhost:3001
echo Frontend will be available at http://localhost:3000
echo.

REM Wait for backend server to be ready by checking for initialization indicators or using a timeout
echo Waiting for backend server to initialize...

REM Set a maximum wait time (30 seconds)
set MAX_WAIT=30
set WAIT_COUNT=0

:check_backend
REM Check for various server ready messages
findstr /c:"Server listening on http://0.0.0.0:3001" backend.log > nul 2>&1
if %errorlevel% equ 0 (
    echo Backend server is ready!
    goto :server_ready
)

findstr /c:"Server listening at http://0.0.0.0:3001" backend.log > nul 2>&1
if %errorlevel% equ 0 (
    echo Backend server is ready!
    goto :server_ready
)

REM Check for nodemon starting
findstr /c:"[nodemon] starting `node src/index.js`" backend.log > nul 2>&1
if %errorlevel% equ 0 (
    echo Backend server is starting...
    set /a WAIT_COUNT+=1
    if !WAIT_COUNT! geq 15 (
        echo Backend initialization detected, continuing...
        goto :server_ready
    )
)

REM Check for metadata initialization
findstr /c:"Initializing translation metadata" backend.log > nul 2>&1
if %errorlevel% equ 0 (
    echo Metadata initialization detected...
    set /a WAIT_COUNT+=1
    if !WAIT_COUNT! geq 20 (
        echo Backend should be ready by now, continuing...
        goto :server_ready
    )
)

REM Implement a timeout mechanism
set /a WAIT_COUNT+=1
if %WAIT_COUNT% geq %MAX_WAIT% (
    echo Maximum wait time reached, assuming server is ready...
    goto :server_ready
)

timeout /t 1 /nobreak > nul
goto :check_backend

:server_ready

REM Wait a moment for frontend to initialize
timeout /t 2 /nobreak > nul

REM Open browser to frontend URL
echo Opening browser to frontend application...
start http://localhost:3000

echo.
echo Press Ctrl+C to stop all servers and exit
echo.

REM Keep the script running until user presses Ctrl+C
:wait_loop
timeout /t 1 /nobreak > nul
goto :wait_loop

REM This section will run when Ctrl+C is pressed
:end
echo.
echo Stopping servers...
if %BACKEND_PID% neq 0 (
    taskkill /F /PID %BACKEND_PID% > nul 2>&1
    echo Backend server stopped.
)
if %FRONTEND_PID% neq 0 (
    taskkill /F /PID %FRONTEND_PID% > nul 2>&1
    echo Frontend server stopped.
)

REM Kill any remaining node processes related to our servers
taskkill /F /FI "WINDOWTITLE eq *npm run dev*" > nul 2>&1

echo All servers stopped.
