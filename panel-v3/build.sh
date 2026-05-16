#!/bin/bash

# Exit on error
set -e

echo "Building KS PANEL v3..."

# 1. Build Frontend
echo "Step 1: Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# 2. Build Go Binary
echo "Step 2: Building Go Binary..."
go mod tidy
go build -o kspanel .

echo "Build Complete: kspanel executable generated."
