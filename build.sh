#!/bin/bash

# Build script for KS Panel standalone executable

set -e

# Configuration
NODE_DIR="panel/node"
RELEASE_DIR="panel/release"
BINARY_NAME="kspanel"
TARGET="node18-linux-x64"

echo "🚀 Starting build process for KS Panel..."

# Ensure release directory exists
mkdir -p "$RELEASE_DIR"

# Navigate to Node source directory
cd "$NODE_DIR"

# Install dependencies if not already present
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --omit=dev
fi

# Build the binary using pkg
echo "🛠️  Compiling binary with pkg..."
npx pkg . --targets "$TARGET" --output "../release/$BINARY_NAME"

# Set executable permission
echo "🔐 Setting executable permissions..."
chmod +x "../release/$BINARY_NAME"

echo "✅ Build complete! Binary located at $RELEASE_DIR/$BINARY_NAME"
echo "💡 Usage:"
echo "   ./$RELEASE_DIR/$BINARY_NAME seed"
echo "   ./$RELEASE_DIR/$BINARY_NAME create:user"
echo "   ./$RELEASE_DIR/$BINARY_NAME --port 8080"
