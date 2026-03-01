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

      // NEW: Validate new manifest fields (like Blueprint)
      if (!pluginConfig.version) {
        console.warn(`Plugin ${pluginConfig.name} missing version in manifest.`);
      }

      // NEW: Check dependencies (NPM or other plugins)
      if (pluginConfig.dependencies) {
        pluginConfig.dependencies.forEach(dep => {
          if (dep.startsWith('plugin:')) {
            const depName = dep.slice(7);
            if (!pluginsJson[depName] || !pluginsJson[depName].enabled) {
              console.warn(`Missing plugin dependency: ${depName} for ${pluginConfig.name}`);
            }
          } else {
            try {
              require.resolve(dep); // Check if NPM module installed
            } catch (e) {
              console.warn(`Missing NPM dependency: ${dep} for ${pluginConfig.name}. Install it!`);
            }
          }
        });
      }

      // NEW: Check permissions (basic log; extend to restrict)
      if (pluginConfig.permissions) {
        console.log(`Plugin ${pluginConfig.name} requires permissions: ${pluginConfig.permissions.join(', ')}`);
        // TODO: Add actual permission checks based on config
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
