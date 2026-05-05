#!/bin/bash

# KS Panel Setup Script
# This script automates the installation and configuration of KS Panel.

set -e

# Stylish Logger
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}[KS Panel]${NC} Starting setup process..."

# 1. Install Dependencies
echo -e "${CYAN}[KS Panel]${NC} Installing dependencies..."
npm install

# 2. Configure Environment
if [ ! -f .env ]; then
    echo -e "${CYAN}[KS Panel]${NC} Creating .env file..."
    cp .env.example .env
    # Generate a random session secret
    SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env
fi

# 3. Configure config.json
if [ ! -f config.json ]; then
    echo -e "${CYAN}[KS Panel]${NC} Creating config.json..."
    cat <<EOF > config.json
{
  "databaseURL": "sqlite://storage/kspanel.sqlite",
  "port": 8080,
  "version": "1.0.0",
  "session_secret": "Random",
  "mode": "development",
  "ogTitle": "KS Panel",
  "ogDescription": "KS Panel is an open-source web panel for managing game servers and applications.",
  "databaseTable": "kspanel",
  "saltRounds": 10
}
EOF
fi

# 4. Database Seeding
echo -e "${CYAN}[KS Panel]${NC} Running database seed..."
echo -e "${YELLOW}[!] This process might take a moment and requires internet access.${NC}"
npm run seed

# 5. Create Admin User (Optional)
echo -e "${CYAN}[KS Panel]${NC} Would you like to create an admin user via CLI? (y/n)"
read -r CREATE_USER
if [ "$CREATE_USER" = "y" ]; then
    echo -e "${YELLOW}[!] You will be prompted to enter your admin credentials.${NC}"
    npm run create:user
else
    echo -e "${CYAN}[KS Panel]${NC} Skipping CLI user creation. You can use the web setup wizard later."
fi

# 6. Start the Panel
echo -e "${CYAN}[KS Panel]${NC} Starting KS Panel with PM2..."
if command -v npx &> /dev/null; then
    npx pm2 start index.js --name ks-panel
    npx pm2 save
    echo -e "${GREEN}[✓]${NC} KS Panel is now running!"
    echo -e "${CYAN}[KS Panel]${NC} You can view the logs with: npx pm2 logs ks-panel"
else
    echo -e "${YELLOW}[!] PM2 not found, starting with node...${NC}"
    node index.js
fi

echo -e "${GREEN}[✓] Setup complete!${NC}"
