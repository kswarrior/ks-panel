#!/bin/bash
set -e
NODE_DIR="panel/node"
RELEASE_DIR="release/kspanel"
BINARY_NAME="kspanel"
TARGET="node18-linux-x64"

echo "🚀 Starting build..."
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR/database/templates"

cd "$NODE_DIR"
npm install --omit=dev

echo "🩹 Patching..."
# Patch node-pty
cat > "node_modules/node-pty/lib/utils.js" <<'INNER_EOF'
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadNativeModule = exports.assign = void 0;
const path = require('path');
function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        Object.keys(source).forEach(key => target[key] = source[key]);
    }
    return target;
}
exports.assign = assign;
function loadNativeModule(name) {
    if (typeof process.pkg !== 'undefined') {
        try {
            const req = eval('require');
            const p = req('path');
            const extPath = p.resolve(p.join(p.dirname(process.execPath), name + ".node"));
            return { dir: p.dirname(process.execPath), module: req(extPath) };
        } catch (e) {}
    }
    var dirs = ['build/Release', 'build/Debug', "prebuilds/" + process.platform + "-" + process.arch];
    var relative = ['..', '.'];
    var lastError;
    for (var d of dirs) {
        for (var r of relative) {
            var dir = r + "/" + d + "/";
            try { return { dir: dir, module: require(dir + "/" + name + ".node") }; } catch (e) { lastError = e; }
        }
    }
    throw new Error("Failed to load native module: " + name + ".node: " + lastError);
}
exports.loadNativeModule = loadNativeModule;
INNER_EOF

# Patch @vscode/sqlite3
cat > "node_modules/@vscode/sqlite3/lib/sqlite3-binding.js" <<'INNER_EOF'
const path = require('path');
let binding;
if (typeof process.pkg !== 'undefined') {
    const req = eval('require');
    const p = req('path');
    binding = req(p.resolve(p.join(p.dirname(process.execPath), 'vscode-sqlite3.node')));
} else {
    binding = require('../build/Release/vscode-sqlite3.node');
}
module.exports = exports = binding;
INNER_EOF

# Patch bcrypt
sed -i 's|var bindings = require(binding_path);|var bindings; if (typeof process.pkg !== "undefined") { const req = eval("require"); const p = req("path"); bindings = req(p.resolve(p.join(p.dirname(process.execPath), "bcrypt_lib.node"))); } else { bindings = require(binding_path); }|' "node_modules/bcrypt/bcrypt.js"

echo "🛠️  Building..."
npx pkg . --targets "$TARGET" --output "../../$RELEASE_DIR/$BINARY_NAME"

echo "📦 Assets..."
find node_modules -name "*.node" -exec cp -f {} "../../$RELEASE_DIR/" \;
cp -r lang "../../$RELEASE_DIR/"
cp -r public "../../$RELEASE_DIR/"
cp -r views "../../$RELEASE_DIR/"
cp -r ../../database/templates/* "../../$RELEASE_DIR/database/templates/" 2>/dev/null || true

cd "../../release/kspanel"
tar -cJf ../../panel.tar.xz .
cd - > /dev/null

chmod +x "../../$RELEASE_DIR/$BINARY_NAME"
echo "✅ Success!"
