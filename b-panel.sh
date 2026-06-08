#!/bin/bash
set -e

echo "Starting build process for KS Panel..."

# 1. Install Node.js dependencies in the root directory
echo "Installing root Node.js dependencies..."
npm install

# 2. Install Node.js dependencies in the panel directory
echo "Installing Node.js dependencies in panel/..."
cd panel
npm install
cd ..

# 3. Build the NAPI-RS addon
echo "Building NAPI-RS addon..."
npx @napi-rs/cli build --release

# 4. Build the Rust CLI binary
echo "Building kspanel CLI binary..."
cargo build --release

# 5. Finalizing
echo "Copying binary to root..."
cp target/release/kspanel ./kspanel
cp target/release/kspanel ./panel/kspanel

echo "Build complete! You can now use ./kspanel"
