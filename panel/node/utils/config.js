const fs = require('node:fs');
const path = require('path');

const isPkg = typeof process.pkg !== 'undefined';
const rootDir = isPkg ? path.dirname(process.execPath) : path.join(__dirname, '..');
const configPath = path.join(rootDir, 'config.json');

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
  if (fs.existsSync(configPath)) {
    try {
      const data = fs.readFileSync(configPath, 'utf8');
      return { ...defaultConfig, ...JSON.parse(data) };
    } catch (e) {
      console.error("Error parsing config.json:", e);
      return defaultConfig;
    }
  } else {
    // Automatically generate config.json if missing
    saveConfig(defaultConfig);
    return defaultConfig;
  }
}

function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (e) {
    console.error("Error saving config.json:", e);
  }
}

module.exports = {
  config: loadConfig(),
  saveConfig,
  configPath
};
