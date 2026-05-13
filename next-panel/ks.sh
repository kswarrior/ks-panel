#!/bin/bash

# KS Panel Automation Script for Next.js Stack

echo "🚀 Starting KS Panel (Next.js) Setup..."

# Ensure we are in the next-panel directory
cd "$(dirname "$0")"

# 1. Setup Database Directory
echo "📂 Setting up storage..."
mkdir -p storage

# 2. Install Dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed."
fi

# 3. Start the Application
echo "⚡ Starting KS Panel on port 8080..."
npm run dev
