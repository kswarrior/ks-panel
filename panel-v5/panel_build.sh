#!/bin/bash

# Exit on error
set -e

echo "Starting KS Panel v5 'One File' build process..."

# Navigate to panel-v5 directory
cd "$(dirname "$0")"

# Detect OS and Architecture for Node.js download
OS="linux"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="darwin"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="win"
fi

ARCH="x64"
if [[ "$(uname -m)" == "arm64" ]] || [[ "$(uname -m)" == "aarch64" ]]; then
    ARCH="arm64"
fi

# Map Architecture names to Node.js format
NODE_ARCH=$ARCH
if [[ "$OS" == "win" && "$ARCH" == "arm64" ]]; then
    NODE_ARCH="arm64"
fi

# Download standalone Node.js binary if not present
NODE_VERSION="v18.20.4"
NODE_DIR="node-${NODE_VERSION}-${OS}-${NODE_ARCH}"
EXTENSION="tar.gz"
if [[ "$OS" == "win" ]]; then
    EXTENSION="zip"
fi

if [ ! -f "node" ] && [ ! -f "node.exe" ]; then
    echo "Downloading Node.js binary ($OS-$NODE_ARCH)..."
    URL="https://nodejs.org/dist/${NODE_VERSION}/${NODE_DIR}.${EXTENSION}"
    if [[ "$OS" == "win" ]]; then
        wget -q "$URL"
        unzip -q "${NODE_DIR}.zip"
        cp "${NODE_DIR}/node.exe" .
        rm -rf "${NODE_DIR}" "${NODE_DIR}.zip"
    else
        wget -q "$URL"
        tar -xzf "${NODE_DIR}.${EXTENSION}"
        cp "${NODE_DIR}/bin/node" .
        rm -rf "${NODE_DIR}" "${NODE_DIR}.${EXTENSION}"
    fi
fi

# Install dependencies (workspaces handled at root)
echo "Installing dependencies..."
npm install

# Build Frontend
echo "Building frontend..."
npm run build --workspace=frontend

# Prepare bundle directory
echo "Preparing bundle..."
rm -rf build_tmp
mkdir -p build_tmp/backend
cp -r backend/src build_tmp/backend/
cp backend/package.json build_tmp/backend/

# Ensure config.json exists
if [ ! -f "backend/src/config.json" ]; then
    echo '{"version": "5.0.0"}' > "build_tmp/backend/src/config.json"
fi

# Copy EJS views from old panel if they don't exist in v5
if [ -d "../panel/views" ]; then
    echo "Copying EJS views from legacy panel..."
    mkdir -p build_tmp/backend/src/views
    cp -r ../panel/views/* build_tmp/backend/src/views/
fi

# Prepare database and plugins directory
echo "Preparing database and plugins..."
mkdir -p build_tmp/backend/database/plugins
echo "{}" > build_tmp/backend/database/plugins/plugins.json

# Install production backend dependencies directly into the bundle
echo "Installing production backend dependencies..."
cd build_tmp/backend
# Use the bundled node to ensure correct ABI (108) for native modules like better-sqlite3
mkdir -p bin_tmp
if [ -f "../../node.exe" ]; then
    cp ../../node.exe bin_tmp/node.exe
else
    cp ../../node bin_tmp/node
fi
ORIGINAL_PATH=$PATH
export PATH="$(pwd)/bin_tmp:$PATH"

npm install --omit=dev --no-workspaces

export PATH=$ORIGINAL_PATH
rm -rf bin_tmp
cd ../..

# Copy frontend build to backend public
mkdir -p build_tmp/backend/src/public
cp -r frontend/out/* build_tmp/backend/src/public/

# Copy Node.js binary to bundle
if [ -f "node.exe" ]; then
    cp node.exe build_tmp/
else
    cp node build_tmp/
fi

# Create compressed tarball
echo "Creating bundle.tar.gz..."
cd build_tmp
tar -czf ../bundle.tar.gz .
cd ..

# Build Rust Binary
echo "Building final kspanel binary..."
cargo build --release

# Move final binary to root
if [ -f "target/release/kspanel.exe" ]; then
    cp target/release/kspanel.exe .
    chmod +x kspanel.exe
else
    cp target/release/kspanel .
    chmod +x kspanel
fi

# Clean up
rm -rf build_tmp bundle.tar.gz node node.exe

echo "=========================================="
echo "Build complete! Portable binary created: ./kspanel"
echo "You can now move this single file anywhere and run it."
echo "=========================================="
