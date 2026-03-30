#!/bin/bash
# KS Panel Global Installer (Download from GitHub)

set -euo pipefail

# Colors
CYAN="\033[1;36m"
BLUE="\033[1;34m"
GREEN="\033[1;32m"
RED="\033[1;31m"
YELLOW="\033[1;33m"
RESET="\033[0m"

log() { echo -e "${CYAN}[KS Panel]${RESET} $1"; }
success() { echo -e "${GREEN}[✓] $1${RESET}"; }
error() { echo -e "${RED}[✗] $1${RESET}"; exit 1; }
warn() { echo -e "${YELLOW}[!] $1${RESET}"; }

has_cmd() { command -v "$1" >/dev/null 2>&1; }

INSTALL_DIR="$HOME/.kspanel/package"
SOURCE_FILE="$INSTALL_DIR/kspanel"
BIN_PATH="/usr/local/bin/kspanel"
REMOTE_URL="https://raw.githubusercontent.com/kswarrior/ks-panel/refs/heads/main/package/kspanel"  # Upload your core script here!

log "» Checking permissions..."
mkdir -p "$INSTALL_DIR"

# Ensure wget or curl exists (with distro support)
if ! has_cmd wget && ! has_cmd curl; then
    log "» wget/curl not found, installing wget..."
    if has_cmd apt; then
        if [ "$EUID" -ne 0 ] && has_cmd sudo; then
            sudo apt update >/dev/null 2>&1
            sudo apt install -y wget >/dev/null 2>&1 || error "Failed to install wget"
        else
            apt update >/dev/null 2>&1
            apt install -y wget >/dev/null 2>&1 || error "Failed to install wget"
        fi
    elif has_cmd yum || has_cmd dnf; then
        PKG_MGR="${has_cmd dnf && echo dnf || echo yum}"
        if [ "$EUID" -ne 0 ] && has_cmd sudo; then
            sudo $PKG_MGR install -y wget >/dev/null 2>&1 || error "Failed to install wget"
        else
            $PKG_MGR install -y wget >/dev/null 2>&1 || error "Failed to install wget"
        fi
    else
        error "wget or curl required and package manager not found"
    fi
fi

log "» Downloading KS Panel script from $REMOTE_URL..."
if has_cmd curl; then
    curl -fsSL "$REMOTE_URL" -o "$SOURCE_FILE" || error "Download failed (check URL or network)"
elif has_cmd wget; then
    wget --show-progress -qO "$SOURCE_FILE" "$REMOTE_URL" || error "Download failed (check URL or network)"
fi

# Verify download (basic sanity check)
if [ ! -s "$SOURCE_FILE" ]; then
    error "Downloaded file is empty (likely 404). Upload the core script to: $REMOTE_URL"
fi

chmod +x "$SOURCE_FILE"

if [ "$EUID" -eq 0 ]; then
    log "» Root detected, installing globally..."
    mv "$SOURCE_FILE" "$BIN_PATH" || error "Install failed"
else
    if has_cmd sudo; then
        log "» Using sudo..."
        sudo mv "$SOURCE_FILE" "$BIN_PATH" || error "Install failed"
        sudo chmod +x "$BIN_PATH"
    else
        error "Root or sudo required for global install"
    fi
fi

chmod +x "$BIN_PATH"

success "Command installed"
echo ""
log "» Run: kspanel"
echo ""
success "Installation complete"
