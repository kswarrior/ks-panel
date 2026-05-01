#!/bin/bash

# KS Panel Setup Script
# This script automates the database setup, panel configuration, and Cloudflare tunnel installation.

set -e

DB_PASS=${DB_PASS:-"kspanelpassword"}
CF_TOKEN=${CF_TOKEN:-"eyJhIjoiZTJkZjY3MDI5ZWZlZTBmY2JhM2ExMjNjN2VmNTcxNTAiLCJ0IjoiNTk5ZTc4NjItZGZjMy00MTNhLWJhMGItMTJlYmNlMDFlZjlhIiwicyI6Ik1UUTBNRFl4TWpBdE5UWXlZeTAwTmpJMkxUazBOemN0WlRreU5HSTNZVGczWXpWbSJ9"}

echo "Setting up PostgreSQL..."
sudo service postgresql start
sudo -u postgres psql -c "CREATE USER ksuser WITH PASSWORD '$DB_PASS';" || true
sudo -u postgres psql -c "CREATE DATABASE kspanel OWNER ksuser;" || true

echo "Installing panel dependencies..."
cd panel
npm install

echo "Configuring panel..."
# config.json and .env should be created/checked here
# (Already created by the installer agent in this session)

echo "Installing Cloudflared..."
if ! command -v cloudflared &> /dev/null; then
    wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O cloudflared
    chmod +x cloudflared
    sudo mv cloudflared /usr/local/bin/cloudflared
fi

echo "Installing Cloudflared service..."
sudo cloudflared service install "$CF_TOKEN" || true

echo "Starting KS Panel with PM2..."
npx pm2 start ecosystem.config.js
npx pm2 save

echo "Setup complete!"
