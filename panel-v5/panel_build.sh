#!/bin/bash

# Exit on error
set -e

echo "Starting KS Panel v5 build process..."

# Navigate to panel-v5 directory
cd "$(dirname "$0")"

# Detect platform and architecture for pkg
PLATFORM="linux"
if [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    PLATFORM="win"
fi

ARCH="x64"
if [[ "$(uname -m)" == "arm64" ]] || [[ "$(uname -m)" == "aarch64" ]]; then
    ARCH="arm64"
fi

TARGET="node18-$PLATFORM-$ARCH"
echo "Build target: $TARGET"

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Build Rust native library
echo "Building Rust native library..."
cargo build --release

# Build Frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Prepare backend public directory
echo "Preparing backend public directory..."
mkdir -p backend/src/public
rm -rf backend/src/public/*
if [ -d "frontend/out" ]; then
    cp -r frontend/out/* backend/src/public/
else
    echo "Error: frontend/out directory not found. Frontend build might have failed."
    exit 1
fi

# Build Backend Binary
echo "Building backend binary..."
cd backend
npm install
# Build for the detected platform
npx pkg . --targets "$TARGET" --output ../kspanel
cd ..

# Ensure binary is executable
if [ -f "kspanel" ]; then
    chmod +x kspanel
elif [ -f "kspanel.exe" ]; then
    chmod +x kspanel.exe
fi

echo "Build complete! You can now run the panel using ./kspanel"
echo "The panel will be listening on port 8080 by default (set PORT env var to change)."
