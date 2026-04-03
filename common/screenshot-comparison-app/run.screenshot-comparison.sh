#!/bin/bash

# Screenshot Comparison App Runner for Mac/Linux
# This script installs dependencies and runs the screenshot comparison tool
# Usage: ./run.screenshot-comparison.sh

echo "Starting Screenshot Comparison App..."
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

cd "$SCRIPT_DIR"

echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install dependencies."
    exit 1
fi

echo
echo "Launching screenshot comparison tool..."
npm run compare
