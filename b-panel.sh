#!/bin/bash
set -e

echo "Starting build process for KS Panel..."

# 1. Install Node.js dependencies in the panel directory
echo "Installing Node.js dependencies in panel/..."
cd panel
npm install
cd ..

# 2. Build the NAPI-RS addon
echo "Building NAPI-RS addon..."
npx napi build --release

# 3. Build the Rust CLI binary
echo "Building kspanel CLI binary..."
cargo build --release

# 4. Finalizing
echo "Copying binary to root..."
cp target/release/kspanel ./kspanel
cp target/release/kspanel ./panel/kspanel

echo "Build complete! You can now use ./kspanel"
