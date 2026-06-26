const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();
const { paths, isPkg } = require("../utils/config.js");

const pluginsJsonPath = path.join(paths.plugins, "plugins.json");

function readPluginsJson() {
  if (!fs.existsSync(pluginsJsonPath)) {
    try {
      const dir = path.dirname(pluginsJsonPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(pluginsJsonPath, "{}", "utf8");
    } catch (e) {
      console.error("Error creating plugins.json:", e);
    }
  }
  try {
    const pluginsJson = fs.readFileSync(pluginsJsonPath, "utf8");
    return JSON.parse(pluginsJson);
  } catch (error) {
    console.error("Error reading plugins.json:", error);
    return {};
  }
}

function loadPlugins(pluginDir) {
  const plugins = {};
  if (!fs.existsSync(pluginDir)) return plugins;

  const pluginFolders = fs.readdirSync(pluginDir);
  const pluginsJson = readPluginsJson();

  pluginFolders.forEach((folder) => {
    if (folder === 'node_modules') return;
    const folderPath = path.join(pluginDir, folder);

    if (fs.statSync(folderPath).isDirectory()) {
      const configPath = path.join(folderPath, "manifest.json");

      if (!fs.existsSync(configPath)) {
        return;
      }

      const pluginConfig = require(configPath);

      if (!pluginsJson[pluginConfig.name]) {
        return;
      }

      if (!pluginsJson[pluginConfig.name].enabled) {
        return;
      }

      if (!pluginConfig.version) {
        pluginConfig.version = '1.0.0';
      }

      plugins[folder] = {
        config: pluginConfig,
      };
    }
  });

  return plugins;
}

module.exports = router;
module.exports.loadPlugins = loadPlugins;
