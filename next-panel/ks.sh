#!/bin/bash

# KS Panel Automation Script for Next.js Stack
set -e # Exit on error

echo "🚀 Starting KS Panel (Next.js) Setup..."

# Ensure we are in the next-panel directory
cd "$(dirname "$0")"

# 1. Setup Database Directory
echo "📂 Setting up storage..."
mkdir -p storage

# 2. Install Dependencies
echo "📦 Installing dependencies..."
npm install

# 3. Start the Application
echo "⚡ Starting KS Panel on port 8080..."
npm run dev
