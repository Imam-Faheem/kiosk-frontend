@echo off
REM Windows batch script to start hardware service
echo Starting Kiosk Hardware Service...
echo.

REM Check if .env exists
if not exist .env (
    echo Warning: .env file not found. Using default configuration.
    echo Copy .env.example to .env and configure your hardware settings.
    echo.
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Start the service
echo Starting service on port %HARDWARE_SERVICE_PORT% (default: 9000)...
node server.js

pause

