#!/bin/bash

# Translation App Runner for Mac/Linux
# This script runs both the backend and frontend of the translation app

echo "Starting Translation App..."
echo

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Node.js could not be found."
    echo "Please install Node.js from https://nodejs.org/"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open https://nodejs.org/en/download/
    else
        xdg-open https://nodejs.org/en/download/ 2>/dev/null || echo "Please visit https://nodejs.org/en/download/ to install Node.js"
    fi
    exit 1
fi

# Set paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Store process IDs for cleanup
BACKEND_PID=0
FRONTEND_PID=0

# Function to clean up on exit
cleanup() {
    echo
    echo "Stopping servers..."
    if [ $BACKEND_PID -ne 0 ]; then
        kill -9 $BACKEND_PID 2>/dev/null
        echo "Backend server stopped."
    fi
    if [ $FRONTEND_PID -ne 0 ]; then
        kill -9 $FRONTEND_PID 2>/dev/null
        echo "Frontend server stopped."
    fi
    
    # Kill any remaining node processes related to our servers
    pkill -f "npm run dev" 2>/dev/null
    
    echo "All servers stopped."
    exit 0
}

# Set up trap to catch Ctrl+C and other termination signals
trap cleanup SIGINT SIGTERM EXIT

echo "Installing backend dependencies..."
cd "$BACKEND_DIR"
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install backend dependencies."
    exit 1
fi

echo "Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install frontend dependencies."
    exit 1
fi

echo "Running scripts..."
cd "$BACKEND_DIR"
npm run generate-metadata
if [ $? -ne 0 ]; then
    echo "Failed to run generate-metadata."
    exit 1
fi

npm run save-meta-keys-usage
if [ $? -ne 0 ]; then
    echo "Failed to run save-meta-keys-usage."
    exit 1
fi

npm run generate-auto-comments-metadata
if [ $? -ne 0 ]; then
    echo "Failed to run generate-auto-comments-metadata"
    exit 1
fi

echo
echo "Starting backend server..."
cd "$BACKEND_DIR"
npm run start > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"

echo "Starting frontend server..."
cd "$FRONTEND_DIR"
npm run build
npm run start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend server started with PID: $FRONTEND_PID"

echo
echo "Translation App is starting..."
echo "Backend will be available at http://localhost:3001"
echo "Frontend will be available at http://localhost:3000"
echo

# Wait for backend server to be ready by checking for the specific message in the log
echo "Waiting for backend server to initialize..."
while ! grep -q "Server listening on http://0.0.0.0:3001" "$BACKEND_DIR/backend.log"; do
    sleep 1
done
echo "Backend server is ready!"

# Wait a moment for frontend to initialize
sleep 2

# Open browser to frontend URL
echo "Opening browser to frontend application..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000 2>/dev/null || echo "Please open http://localhost:3000 in your browser"
else
    echo "Please open http://localhost:3000 in your browser"
fi

echo
echo "Press Ctrl+C to stop all servers and exit"
echo

# Keep the script running until user presses Ctrl+C
while true; do
    sleep 1
done
