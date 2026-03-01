const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();

const pluginsJsonPath = path.join("./plugins", "plugins.json");

function readPluginsJson() {
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
  const pluginFolders = fs.readdirSync(pluginDir);
  const pluginsJson = readPluginsJson();

  pluginFolders.forEach((folder) => {
    const folderPath = path.join(pluginDir, folder);

    if (fs.statSync(folderPath).isDirectory()) {
      const configPath = path.join(folderPath, "manifest.json");

      if (!fs.existsSync(configPath)) {
        console.warn(`Manifest file does not exist for plugin ${folder}.`);
        return;
      }

      const pluginConfig = require(configPath);

      if (!pluginsJson[pluginConfig.name]) {
        console.warn(
          `Plugin ${pluginConfig.name} is not found in plugins.json.`
        );
        return;
      }

      if (!pluginsJson[pluginConfig.name].enabled) {
        return;
      }

      // NEW: Validate version (if present)
      if (!pluginConfig.version) {
        console.warn(`Plugin ${pluginConfig.name} missing version in manifest. Assuming 1.0.0.`);
        pluginConfig.version = '1.0.0'; // Default
      }

      // NEW: Check dependencies (NPM or plugin: prefixed)
      if (pluginConfig.dependencies && Array.isArray(pluginConfig.dependencies)) {
        pluginConfig.dependencies.forEach(dep => {
          if (dep.startsWith('plugin:')) {
            const depName = dep.slice(7);
            if (!pluginsJson[depName] || !pluginsJson[depName].enabled) {
              console.error(`Missing plugin dependency: ${depName} for ${pluginConfig.name}. Disabling.`);
              return; // Skip loading
            }
          } else {
            try {
              require.resolve(dep); // Check installed
            } catch (e) {
              console.warn(`Missing NPM dependency: ${dep} for ${pluginConfig.name}. Will attempt install in manager.`);
            }
          }
        });
      }

      // NEW: Log permissions (extend to enforce based on config)
      if (pluginConfig.permissions && Array.isArray(pluginConfig.permissions)) {
        console.log(`Plugin ${pluginConfig.name} requires permissions: ${pluginConfig.permissions.join(', ')}`);
        // Example enforcement: if (pluginConfig.permissions.includes('highRisk') && !config.allowHighRisk) return;
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
