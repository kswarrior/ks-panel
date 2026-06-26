#!/bin/bash

# Build script for KS Panel standalone executable

set -e

# Configuration
NODE_DIR="panel/node"
RELEASE_DIR="release/kspanel"
BINARY_NAME="kspanel"
TARGET="node18-linux-x64"

echo "🚀 Starting build process for KS Panel..."

# Ensure release directory exists from project root
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

# Navigate to Node source directory
cd "$NODE_DIR"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --omit=dev

# Patch native modules for pkg compatibility
echo "🩹 Patching native modules for pkg..."

# 1. Patch node-pty
PTY_UTILS="node_modules/node-pty/lib/utils.js"
if [ -f "$PTY_UTILS" ]; then
    cat > "$PTY_UTILS" <<INNER_EOF
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadNativeModule = exports.assign = void 0;
const path = require('path');
function assign(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    sources.forEach(function (source) { return Object.keys(source).forEach(function (key) { return target[key] = source[key]; }); });
    return target;
}
exports.assign = assign;
function loadNativeModule(name) {
    if (typeof process.pkg !== 'undefined') {
        const externalPath = path.resolve(path.join(path.dirname(process.execPath), name + ".node"));
        try {
            // Using eval('require') to bypass pkg's static analysis and force external load
            const requireFunc = eval('require');
            return { dir: path.dirname(process.execPath), module: requireFunc(externalPath) };
        } catch (e) {
            // Fallback
        }
    }
    var dirs = ['build/Release', 'build/Debug', "prebuilds/" + process.platform + "-" + process.arch];
    var relative = ['..', '.'];
    var lastError;
    for (var _i = 0, dirs_1 = dirs; _i < dirs_1.length; _i++) {
        var d = dirs_1[_i];
        for (var _a = 0, relative_1 = relative; _a < relative_1.length; _a++) {
            var r = relative_1[_a];
            var dir = r + "/" + d + "/";
            try {
                return { dir: dir, module: require(dir + "/" + name + ".node") };
            }
            catch (e) {
                lastError = e;
            }
        }
    }
    throw new Error("Failed to load native module: " + name + ".node, checked: " + dirs.join(', ') + ": " + lastError);
}
exports.loadNativeModule = loadNativeModule;
INNER_EOF
fi

# 2. Patch @vscode/sqlite3
SQLITE_BINDING="node_modules/@vscode/sqlite3/lib/sqlite3-binding.js"
if [ -f "$SQLITE_BINDING" ]; then
    cat > "$SQLITE_BINDING" <<INNER_EOF
const path = require('path');
let binding;
if (typeof process.pkg !== 'undefined') {
    const externalPath = path.resolve(path.join(path.dirname(process.execPath), 'vscode-sqlite3.node'));
    const requireFunc = eval('require');
    binding = requireFunc(externalPath);
} else {
    binding = require('../build/Release/vscode-sqlite3.node');
}
module.exports = exports = binding;
INNER_EOF
fi

# 3. Patch bcrypt
BCRYPT_JS="node_modules/bcrypt/bcrypt.js"
if [ -f "$BCRYPT_JS" ]; then
    # We use sed to replace the requirement of binding_path with eval('require') of external path
    sed -i 's|var bindings = require(binding_path);|var bindings; if (typeof process.pkg !== "undefined") { const requireFunc = eval("require"); const externalPath = require("path").resolve(require("path").join(require("path").dirname(process.execPath), "bcrypt_lib.node")); bindings = requireFunc(externalPath); } else { bindings = require(binding_path); }|' "$BCRYPT_JS"
fi

# Build the binary using pkg
echo "🛠️  Compiling binary with pkg..."
npx pkg . --targets "$TARGET" --output "../../$RELEASE_DIR/$BINARY_NAME"

# Copy native modules
echo "📦 Copying native modules to release folder..."
find node_modules -name "*.node" -exec cp -f {} "../../$RELEASE_DIR/" \;

# Copy assets to release
echo "📦 Copying assets (lang, public, views, templates)..."
cp -r lang "../../$RELEASE_DIR/"
cp -r public "../../$RELEASE_DIR/"
cp -r views "../../$RELEASE_DIR/"
mkdir -p "../../$RELEASE_DIR/database/templates"
cp -r database/templates/* "../../$RELEASE_DIR/database/templates/" 2>/dev/null || true

# Create panel.tar.xz
echo "📦 Creating panel.tar.xz..."
cd "../../release/kspanel"
tar -cJf ../../panel.tar.xz .
cd - > /dev/null

# Set executable permission
echo "🔐 Setting executable permissions..."
chmod +x "../../$RELEASE_DIR/$BINARY_NAME"

echo "✅ Build complete! Assets collected in $RELEASE_DIR and panel.tar.xz created."
