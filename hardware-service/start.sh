#!/bin/bash
# Linux/Mac script to start hardware service

echo "Starting Kiosk Hardware Service..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Warning: .env file not found. Using default configuration."
    echo "Copy .env.example to .env and configure your hardware settings."
    echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Start the service
echo "Starting service on port ${HARDWARE_SERVICE_PORT:-9000}..."
node server.js

