#!/bin/bash

# Build script for KS Panel standalone executable

set -e

# Configuration
NODE_DIR="panel/node"
RELEASE_DIR="release/kspanel"
BINARY_NAME="kspanel"
TARGET="node18-linux-x64"

echo "🚀 Starting build process for KS Panel..."

# Ensure release directory exists from project root
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
# pkg output path is relative to current dir (panel/node)
npx pkg . --targets "$TARGET" --output "../../$RELEASE_DIR/$BINARY_NAME"

# Copy native modules
echo "📦 Copying native modules to release folder..."
# Find all .node files and copy them to the release folder
# We use a flat structure for simplicity
find node_modules -name "*.node" -exec cp {} "../../$RELEASE_DIR/" \;

# Set executable permission
echo "🔐 Setting executable permissions..."
chmod +x "../../$RELEASE_DIR/$BINARY_NAME"

echo "✅ Build complete! Binary and native modules are in $RELEASE_DIR"
echo "💡 Usage:"
echo "   cd $RELEASE_DIR"
echo "   ./$BINARY_NAME seed"
echo "   ./$BINARY_NAME create:user"
echo "   ./$BINARY_NAME --port 8080"
