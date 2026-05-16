#!/bin/bash

# Exit on error
set -e

echo "Building KS EDGE..."

# 1. Build Go Binary
echo "Step 1: Building Go Binary..."
go mod tidy
go build -o ksedge .

echo "Build Complete: ksedge executable generated."
