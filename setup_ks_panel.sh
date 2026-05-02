#!/bin/bash

# KS Panel Setup Script
# This script automates the database setup, panel configuration, and Cloudflare tunnel installation.

set -e

# Load defaults or prompt if interactive
if [ -z "$DB_PASS" ]; then
    read -sp "Enter PostgreSQL password for ksuser: " DB_PASS
    echo
fi

if [ -z "$CF_TOKEN" ]; then
    read -p "Enter Cloudflare Tunnel Token: " CF_TOKEN
fi

echo "Setting up PostgreSQL..."
sudo service postgresql start
sudo -u postgres psql -c "CREATE USER ksuser WITH PASSWORD '$DB_PASS';" || true
sudo -u postgres psql -c "CREATE DATABASE kspanel OWNER ksuser;" || true

echo "Installing panel dependencies..."
cd panel
npm install

echo "Configuring panel..."
if [ ! -f .env ]; then
    cp .env.example .env
    sed -i "s/YOUR_DB_PASSWORD/$DB_PASS/g" .env
    sed -i "s/YOUR_SESSION_SECRET/$(openssl rand -hex 32)/g" .env
fi

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
