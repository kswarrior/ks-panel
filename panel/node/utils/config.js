const fs = require('node:fs');
const path = require('path');

const isPkg = typeof process.pkg !== 'undefined';
// rootDir is the directory where the executable resides when packaged,
// or the project root in development.
const rootDir = isPkg ? path.dirname(process.execPath) : path.resolve(__dirname, '..');

const paths = {
    database: path.resolve(rootDir, 'database'),
    templates: path.resolve(rootDir, 'database/templates'),
    instances: path.resolve(rootDir, 'database/instances'),
    plugins: path.resolve(rootDir, 'database/plugins'),
    storage: path.resolve(rootDir, 'storage'),
    lang: path.resolve(rootDir, 'lang'),
    public: path.resolve(rootDir, 'public'),
    views: path.resolve(rootDir, 'views'),
    config: path.resolve(rootDir, 'config.json')
};

const defaultConfig = {
  version: "1.0.0",
  port: 3000,
  session_secret: "secret",
  databaseURL: "sqlite://storage/database.sqlite",
  databaseTable: "kspanel",
  mode: "development",
  ogTitle: "KS Panel",
  ogDescription: "A powerful game server management panel."
};

function loadConfig() {
  if (fs.existsSync(paths.config)) {
    try {
      const data = fs.readFileSync(paths.config, 'utf8');
      return { ...defaultConfig, ...JSON.parse(data) };
    } catch (e) {
      console.error("Error parsing config.json:", e);
      return defaultConfig;
    }
  } else {
    // Generate default config.json
    try {
        const configDir = path.dirname(paths.config);
        if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
        fs.writeFileSync(paths.config, JSON.stringify(defaultConfig, null, 2), 'utf8');
    } catch (e) {
        // Might be read-only filesystem, just return default
    }
    return defaultConfig;
  }
}

function saveConfig(config) {
  try {
    const dir = path.dirname(paths.config);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(paths.config, JSON.stringify(config, null, 2), 'utf8');
  } catch (e) {
    console.error("Error saving config.json:", e);
  }
}

module.exports = {
  config: loadConfig(),
  saveConfig,
  configPath: paths.config,
  rootDir,
  isPkg,
  paths
};
