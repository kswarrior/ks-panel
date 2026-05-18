#!/bin/bash

# KS Panel Start Script
# A simple wrapper to start the panel after it has been set up.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f "config.json" ] || [ ! -d "node_modules" ]; then
    echo "First time setup detected. Running setup.sh..."
    bash setup.sh
    exit $?
fi

if command -v pm2 &> /dev/null; then
    pm2 start index.js --name ks-panel || pm2 restart ks-panel
    echo "KS Panel started with PM2."
    pm2 logs ks-panel
else
    echo "Starting KS Panel with Node.js..."
    node index.js
fi
