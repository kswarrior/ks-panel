#!/bin/bash

# KS Panel Setup & Start Script
# This script automates the installation, configuration, and startup of KS Panel.

set -e

# Stylish Logger
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ensure we are in the panel directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${CYAN}[KS Panel]${NC} Starting setup process..."

# 1. Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[✗] Node.js is not installed. Please install Node.js v18 or higher.${NC}"
    exit 1
fi

# 2. Install Dependencies
echo -e "${CYAN}[KS Panel]${NC} Installing dependencies... (This may take a minute)"
npm install --quiet

# 3. Directory Preparation
echo -e "${CYAN}[KS Panel]${NC} Preparing directories..."
mkdir -p storage uploads logs database/plugins

# 4. Configure Environment
if [ ! -f .env ]; then
    echo -e "${CYAN}[KS Panel]${NC} Creating .env file..."
    if [ -f .env.example ]; then
        cp .env.example .env
        SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        # Use a more portable sed command for SESSION_SECRET
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env
        else
            sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env
        fi
    else
        echo "SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" > .env
        echo "DB_URL=sqlite://storage/kspanel.sqlite" >> .env
    fi
fi

# 5. Configure config.json
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

# 6. Database Seeding
echo -e "${CYAN}[KS Panel]${NC} Checking database status..."
# Check if images exist in the sqlite database
DB_PATH="storage/kspanel.sqlite"
if [ ! -f "$DB_PATH" ]; then
    echo -e "${YELLOW}[!] Database not found. Running seed...${NC}"
    NON_INTERACTIVE=true npm run seed
else
    echo -e "${GREEN}[✓] Database exists.${NC}"
fi

# 7. Check for Port 8080
PORT=$(node -e "try { console.log(require('./config.json').port || 8080) } catch(e) { console.log(8080) }")
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}[!] Port $PORT is already in use.${NC}"
    printf "${CYAN}[KS Panel]${NC} Would you like to kill the process on port $PORT? (y/n): "
    read -r KILL_PORT || KILL_PORT="n"
    if [[ "$KILL_PORT" =~ ^[Yy]$ ]]; then
        kill -9 $(lsof -t -i :$PORT) || true
        echo -e "${GREEN}[✓] Process killed.${NC}"
    else
        echo -e "${RED}[✗] Cannot start panel while port $PORT is occupied.${NC}"
        exit 1
    fi
fi

# 8. Final Start
echo -e "${GREEN}[✓] Setup complete!${NC}"
echo -e "${CYAN}[KS Panel]${NC} Starting the panel..."

# Check if PM2 is preferred
if command -v pm2 &> /dev/null; then
    pm2 delete ks-panel 2>/dev/null || true
    pm2 start index.js --name ks-panel
    echo -e "${GREEN}[✓] Started with PM2.${NC}"
    echo -e "${CYAN}[KS Panel]${NC} Use 'pm2 logs ks-panel' to see logs."
else
    echo -e "${YELLOW}[!] PM2 not found. Starting with direct Node.js...${NC}"
    node index.js
fi
