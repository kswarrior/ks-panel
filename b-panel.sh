#!/bin/bash

set -e

# Stylish Logger
CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${CYAN}[KS Panel Build]${NC} Installing panel dependencies..."
cd panel
npm install --quiet
cd ..

echo -e "${CYAN}[KS Panel Build]${NC} Compiling Rust CLI and native addon..."
cargo build --release

cp target/release/kspanel panel/kspanel

echo -e "${CYAN}[KS Panel Build]${NC} Build complete!"
echo -e "${GREEN}[✓]${NC} You can now use ./panel/kspanel to manage the panel."
