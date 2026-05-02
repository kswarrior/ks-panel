#!/bin/bash
set -e

TOKEN="eyJhIjoiZTJkZjY3MDI5ZWZlZTBmY2JhM2ExMjNjN2VmNTcxNTAiLCJ0IjoiNTk5ZTc4NjItZGZjMy00MTNhLWJhMGItMTJlYmNlMDFlZjlhIiwicyI6Ik1UUTBNRFl4TWpBdE5UWXlZeTAwTmpJMkxUazBOemN0WlRreU5HSTNZVGczWXpWbSJ9"

echo "Installing cloudflared..."
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
rm cloudflared-linux-amd64.deb

echo "Installing cloudflared service..."
sudo cloudflared service install "$TOKEN"

echo "Installing PostgreSQL..."
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql

echo "Configuring Database..."
sudo -u postgres psql -c "CREATE USER ksuser WITH PASSWORD 'your_secure_password';" || true
sudo -u postgres psql -c "CREATE DATABASE kspanel OWNER ksuser;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kspanel TO ksuser;" || true

echo "Preparing KS Panel..."
cd panel
npm install

echo "Seeding Database..."
npm run seed

echo "Creating requested user..."
node -e 'const { db } = require("./handlers/db.js"); const bcrypt = require("bcrypt"); const { v4: uuidv4 } = require("uuid"); async function run() { const hashedPassword = await bcrypt.hash("kshosting@55", 10); let users = await db.get("users") || []; users.push({ userId: uuidv4(), username: "kshosting", email: "kshosting@ksmail.com", password: hashedPassword, accessTo: [], admin: true, verified: true }); await db.set("users", users); console.log("User kshosting added"); process.exit(0); } run();'

echo "Creating Systemd Service for KS Panel..."
sudo tee /etc/systemd/system/kspanel.service > /dev/null <<SERVICEEOF
[Unit]
Description=KS Panel
After=network.target postgresql.service

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/node index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SERVICEEOF

sudo systemctl daemon-reload
sudo systemctl enable kspanel
sudo systemctl start kspanel

echo "Setup complete! Panel is running and Cloudflare Tunnel is active."
