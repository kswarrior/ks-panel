const https = require('https');
const path = require('path');
const { execSync } = require('child_process');
const Module = require('module');
const fsOriginal = require('fs');
const { Readable } = require('stream');

const REPO_OWNER = 'kswarrior';
const REPO_NAME = 'ks-panel';
const BRANCH = 'main';
const PANEL_FOLDER = 'panel';

const RAW_BASE = `https://raw.githubusercontent.com/\( {REPO_OWNER}/ \){REPO_NAME}/\( {BRANCH}/ \){PANEL_FOLDER}/`;
const TREE_URL = `https://api.github.com/repos/\( {REPO_OWNER}/ \){REPO_NAME}/git/trees/${BRANCH}?recursive=1`;

let fileCache = new Map();   // only source code (js, ejs, txt, etc.)
let dirMap = new Map();

// ====================== FETCH HELPER ======================
async function fetchUrl(url) {
  const options = process.env.GITHUB_TOKEN ? { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } } : {};
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`GitHub fetch failed: ${res.statusCode} for ${url}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// ====================== PRELOAD ONLY SOURCE FILES ======================
async function preloadAllFiles() {
  console.log('🔄 Loading KS Panel from GitHub (source code in memory only)...');

  let treeJson;
  try {
    treeJson = JSON.parse(await fetchUrl(TREE_URL));
  } catch (err) {
    console.error('❌ Failed to fetch repo tree:', err.message);
    process.exit(1);
  }

  const files = treeJson.tree.filter(f => 
    f.type === 'blob' && 
    f.path.startsWith(PANEL_FOLDER + '/') &&
    !f.path.endsWith('config.json') &&   // ← will be local
    !f.path.endsWith('.env') &&         // ← will be local
    !f.path.includes('storage/')        // ← local writable
  );

  await Promise.all(files.map(async (file) => {
    const relPath = file.path.replace(PANEL_FOLDER + '/', '');
    const rawUrl = RAW_BASE + relPath;
    try {
      const content = await fetchUrl(rawUrl);
      fileCache.set(relPath, content);

      const dir = path.dirname(relPath);
      if (!dirMap.has(dir)) dirMap.set(dir, []);
      dirMap.get(dir).push(path.basename(relPath));
    } catch (err) {
      console.warn(`⚠️ Skipped file ${relPath}: ${err.message}`);
    }
  }));

  console.log(`✅ Loaded ${fileCache.size} source files into memory!`);
}

// ====================== PATH NORMALIZER + DATABASE EXCEPTION ======================
function normalizeToRepoPath(p) {
  if (typeof p !== 'string') return p;
  const lower = p.toLowerCase();
  
  // Exception: database/ and storage/ stay on local VPS filesystem
  if (lower.includes('database') || lower.includes('../database') || lower.includes('storage')) {
    return p; // ← local
  }

  let resolved = path.resolve('/panel', p);
  let rel = path.relative('/panel', resolved).replace(/\\/g, '/');
  if (rel.startsWith('..')) rel = p.replace(/\\/g, '/');
  return rel;
}

// ====================== FULL FS PROXY ======================
const fsProxy = {
  readFileSync: (p, options) => {
    const rel = normalizeToRepoPath(p);
    if (fileCache.has(rel)) return fileCache.get(rel);
    return fsOriginal.readFileSync(p, options);
  },
  readdirSync: (dir) => {
    const relDir = normalizeToRepoPath(dir);
    if (dirMap.has(relDir)) return dirMap.get(relDir);
    return fsOriginal.readdirSync(dir);
  },
  statSync: (p) => {
    const rel = normalizeToRepoPath(p);
    if (fileCache.has(rel)) return { isFile: () => true, isDirectory: () => false, size: 2048 };
    return fsOriginal.statSync(p);
  },
  existsSync: (p) => {
    const rel = normalizeToRepoPath(p);
    if (fileCache.has(rel)) return true;
    return fsOriginal.existsSync(p);
  },
  createReadStream: (p) => {
    const rel = normalizeToRepoPath(p);
    if (fileCache.has(rel)) {
      return Readable.from(fileCache.get(rel));
    }
    return fsOriginal.createReadStream(p);
  }
};

// ====================== OVERRIDE require + fs ======================
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'fs' || request === 'node:fs') return fsProxy;

  if (request.startsWith('.') && parent) {
    const parentDir = path.dirname(parent.filename || '/panel/index.js');
    let resolved = path.resolve(parentDir, request);
    let rel = normalizeToRepoPath(resolved);

    if (fileCache.has(rel)) {
      const code = fileCache.get(rel);
      const m = new Module(resolved, parent);
      m.filename = resolved;
      m.paths = Module._nodeModulePaths(path.dirname(resolved));

      if (rel.endsWith('.json')) {
        m.exports = JSON.parse(code);
      } else {
        m._compile(code, resolved);
      }
      return m.exports;
    }
  }
  return originalLoad.apply(this, arguments);
};

// ====================== START ======================
async function start() {
  try {
    // 1. Install dependencies
    const pkgContent = await fetchUrl(RAW_BASE + 'package.json');
    fsOriginal.writeFileSync('package.json', pkgContent);
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // 2. Save config + .env locally (so you can edit DB password, etc.)
    const configContent = await fetchUrl(RAW_BASE + 'config.json');
    fsOriginal.writeFileSync('config.json', configContent);
    console.log('⚙️ config.json saved locally');

    try {
      const envContent = await fetchUrl(RAW_BASE + '.env');
      fsOriginal.writeFileSync('.env', envContent);
      console.log('🔑 .env saved locally (optional)');
    } catch (e) {
      console.log('ℹ️ No .env in repo or failed to fetch — skipping');
    }

    // 3. Preload source files from repo
    await preloadAllFiles();

    // 4. Run the real index.js (will listen on port 8080 from config.json)
    const indexCode = fileCache.get('index.js');
    if (!indexCode) throw new Error('index.js not found in repo');

    const mainModule = new Module('/panel/index.js');
    mainModule.filename = '/panel/index.js';
    mainModule._compile(indexCode, '/panel/index.js');

    console.log('\n🚀 KS Panel is FULLY RUNNING!');
    console.log('   → Open in browser: http://localhost:8080  (or your VPS IP:8080)');
    console.log('   → Port is 8080 (from config.json)');
    console.log('   → Only ks-launcher.js + node_modules + config/.env/storage/database exist locally');
    console.log('   → All other panel code is loaded from GitHub into memory');
  } catch (err) {
    console.error('❌ Startup failed:', err.message);
    process.exit(1);
  }
}

start();
