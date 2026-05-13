#!/bin/bash

# KS Panel Automation Script for Next.js Stack
set -e # Exit on error

echo "🚀 Starting KS Panel (Next.js) High-Performance Setup..."

# Ensure we are in the next-panel directory
cd "$(dirname "$0")"

# 1. Setup Database Directory
echo "📂 Setting up storage..."
mkdir -p storage

# 2. Install Dependencies
echo "📦 Installing dependencies..."
npm install

# 3. Build for Production (Maximum Performance)
echo "🏗️ Building for production (this may take a minute)..."
npm run build

# 4. Start the Application in Production Mode
echo "⚡ Starting KS Panel on port 8080 (PROD MODE)..."
npm run start
