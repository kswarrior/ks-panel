const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const log = new (require("cat-loggr"))();
const { isAdmin } = require("../utils/isAdmin");
const AdmZip = require('adm-zip');
const https = require('https');
const multer = require("multer");
const upload = multer({ dest: 'storage/temp/' });

const router = express.Router();

router.checkPluginPermission = async (pluginName, permission) => {
  try {
    const pluginsJson = await readPluginsJson();
    const config = pluginsJson[pluginName];
    if (!config || !config.enabled) return false;
    if (!config.approved_permissions) return false;
    return config.approved_permissions.includes(permission);
  } catch (e) { return false; }
};

let pluginList = [];
let pluginSidebar = {};

const pluginsDir = path.resolve(__dirname, "../../database/plugins");
const pluginsJsonPath = path.resolve(__dirname, "../../database/plugins/plugins.json");

let isLoadingPlugins = false;

// Injected from index.js
let events = null;
let appInstance = null;
let dbInstance = null;

// Setter for injections
router.setAppAndDb = (app, db) => {
  appInstance = app;
  dbInstance = db;
};

async function readPluginsJson() {
  try {
    const pluginsJson = await fs.promises.readFile(pluginsJsonPath, "utf8");
    if (!pluginsJson.trim()) {
      log.error("Error: plugins.json is empty.");
      return {};
    }
    const parsed = JSON.parse(pluginsJson);
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      log.error("SyntaxError in plugins.json:", error.message);
    } else {
      log.error("Error reading plugins.json:", error.message);
    }
    return {};
  }
}

async function writePluginsJson(plugins) {
  try {
    const tempPath = pluginsJsonPath + ".tmp";
    await fs.promises.writeFile(
      tempPath,
      JSON.stringify(plugins, null, 4),
      "utf8"
    );
    await fs.promises.rename(tempPath, pluginsJsonPath);
    log.info("plugins.json successfully written.");
  } catch (error) {
    log.error("Error writing plugins.json:", error.message);
  }
}

async function checkAndInstallModule(moduleName) {
  return new Promise((resolve, reject) => {
    exec(`npm install ${moduleName}`, (error, stdout, stderr) => {
      if (error) {
        log.error(`Error installing module ${moduleName}: ${stderr}`);
        reject(new Error(`Could not install ${moduleName}.`));
      } else {
        log.info(`Successfully installed module ${moduleName}.`);
        resolve();
      }
    });
  });
}

async function validatePlugin(pluginPath, manifest) {
  const errors = [];

  const mainFilePath = path.join(pluginPath, manifest.main);
  if (!fs.existsSync(mainFilePath)) {
    errors.push(`Main file '${manifest.main}' not found in '${pluginPath}'.`);
  }

  if (manifest.dependencies && Array.isArray(manifest.dependencies)) {
    for (const dep of manifest.dependencies) {
      if (!dep.startsWith('plugin:')) {
        try {
          require.resolve(dep);
        } catch (e) {
          log.warn(`Missing dep ${dep} for ${manifest.name}. Installing...`);
          try {
            await checkAndInstallModule(dep);
          } catch (installErr) {
            errors.push(`Failed to install dep ${dep}`);
          }
        }
      }
    }
  }

  try {
    require(mainFilePath);
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      const moduleName = error.message.split(" ")[1];
      log.warn(
        `Module not found for plugin '${manifest.name}' in '${pluginPath}'. Attempting to install '${moduleName}'...`
      );
      try {
        await checkAndInstallModule(moduleName);
      } catch (installError) {
        errors.push(
          `Failed to install module '${moduleName}' for plugin '${manifest.name}'.`
        );
      }
    } else {
      errors.push(
        `Error loading main file for plugin '${manifest.name}': ${error.message} in '${pluginPath}'.`
      );
    }
  }

  return errors;
}

async function loadAndActivatePlugins() {
  if (isLoadingPlugins) {
    log.warn("loadAndActivatePlugins is already running.");
    return;
  }
  isLoadingPlugins = true;

  try {
    pluginList = [];
    pluginSidebar = {};
    const errors = [];

    Object.keys(require.cache).forEach((key) => {
      if (key.startsWith(pluginsDir)) {
        delete require.cache[key];
      }
    });

    let pluginsJson = await readPluginsJson();
    const pluginDirs = await fs.promises.readdir(pluginsDir);

    log.info("Loading plugins...");

    for (const pluginName of pluginDirs) {
      const pluginPath = path.join(pluginsDir, pluginName);
      const manifestPath = path.join(pluginPath, "manifest.json");

      const isDirectory = fs.statSync(pluginPath).isDirectory();
      if (!isDirectory) continue;

      if (!fs.existsSync(manifestPath)) {
        log.warn(`Manifest file does not exist for plugin '${pluginName}'.`);
        continue;
      }

      let manifest;
      try {
        const manifestContent = fs.readFileSync(manifestPath, "utf8");
        manifest = JSON.parse(manifestContent);

        if (!pluginsJson[manifest.name]) {
          pluginsJson[manifest.name] = { enabled: true };
        }
      } catch (error) {
        log.error(
          `Error loading manifest for plugin '${pluginName}': ${error.message}.`
        );
        errors.push(`Manifest error: ${error.message}`);
        continue;
      }

      const pluginConfig = pluginsJson[manifest.name];

      log.info(
        `Loading plugin '${pluginName}', enabled: ${pluginConfig.enabled}`
      );

      const validationErrors = await validatePlugin(pluginPath, manifest);
      if (validationErrors.length > 0) {
        validationErrors.forEach((err) =>
          log.error(`Validation error in plugin '${pluginName}': ${err}`)
        );
        log.error(
          `Plugin '${pluginName}' has validation errors but will still be listed.`
        );
        pluginConfig.enabled = false;
        errors.push(`Validation errors in '${pluginName}'`);
      }

      manifest.directoryname = pluginName;
      manifest.manifestpath = manifestPath;
      pluginList.push(manifest);

      let pluginModule;

      try {
        pluginModule = require(path.join(pluginPath, manifest.main));
        if (typeof pluginModule.register === "function") {
          pluginModule.register({
            app: appInstance,
            db: dbInstance,
            events,
            pluginManager: global.pluginManager,
            checkPermission: (perm) => router.checkPluginPermission(manifest.name, perm),
            executeCommand: async (cmd) => {
              if (await router.checkPluginPermission(manifest.name, 'terminal:exec')) {
                return new Promise((resolve, reject) => {
                  exec(cmd, (error, stdout, stderr) => {
                    if (error) reject(stderr);
                    else resolve(stdout);
                  });
                });
              }
              throw new Error("Permission Denied: terminal:exec");
            }
          });
        }

        if (pluginModule.router && typeof pluginModule.router === "function") {
          // Wrapped router to inject permission checks automatically if needed
          router.use(`/${manifest.router}`, (req, res, next) => {
            req.pluginName = manifest.name;
            pluginModule.router(req, res, next);
          });
        } else {
          log.error(
            `Router for plugin '${pluginName}' is not a valid middleware function.`
          );
        }

        if (manifest.adminsidebar) {
          Object.assign(pluginSidebar, manifest.adminsidebar);
        }
      } catch (error) {
        log.error(`Error loading plugin '${pluginName}': ${error.message}.`);
        pluginConfig.enabled = false;
        errors.push(`Loading error in '${pluginName}': ${error.message}`);
      }
    }

    await writePluginsJson(pluginsJson);

    if (errors.length > 0) {
      log.error(`Errors occurred while loading plugins: ${errors.join(", ")}`);
    }
  } finally {
    isLoadingPlugins = false;
  }
}

async function installFromKspp(ksppPath) {
  const zip = new AdmZip(ksppPath);
  const tempDir = path.join(pluginsDir, 'temp');
  fs.mkdirSync(tempDir, { recursive: true });
  zip.extractAllTo(tempDir, true);

  const extractedDirs = fs.readdirSync(tempDir).filter(f => fs.statSync(path.join(tempDir, f)).isDirectory());
  if (extractedDirs.length !== 1) throw new Error('KSPP must contain exactly one plugin folder');

  const pluginFolder = extractedDirs[0];
  const targetPath = path.join(pluginsDir, pluginFolder);
  if (fs.existsSync(targetPath)) throw new Error(`Plugin ${pluginFolder} already exists`);

  fs.renameSync(path.join(tempDir, pluginFolder), targetPath);
  fs.rmSync(tempDir, { recursive: true, force: true });

  const manifestPath = path.join(targetPath, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const pluginsJson = await readPluginsJson();
  pluginsJson[manifest.name] = { enabled: true };
  await writePluginsJson(pluginsJson);

  log.info(`Installed plugin: ${manifest.name}`);
  await loadAndActivatePlugins();
}

async function uninstall(pluginName) {
  const pluginPath = path.join(pluginsDir, pluginName);
  if (!fs.existsSync(pluginPath)) throw new Error(`Plugin ${pluginName} not found`);

  const manifestPath = path.join(pluginPath, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const pluginModule = require(path.join(pluginPath, manifest.main));
  if (typeof pluginModule.unregister === "function") {
    pluginModule.unregister({ app: appInstance, db: dbInstance, events });
  }

  fs.rmSync(pluginPath, { recursive: true, force: true });

  const pluginsJson = await readPluginsJson();
  delete pluginsJson[manifest.name];
  await writePluginsJson(pluginsJson);

  log.info(`Uninstalled plugin: ${manifest.name}`);
  await loadAndActivatePlugins();
}

function listPlugins() {
  return pluginList.map(p => `${p.name} v${p.version || 'unknown'} (enabled: ${pluginsJson[p.name]?.enabled})`);
}

async function fetchStorePlugins() {
  return new Promise((resolve, reject) => {
    https.get('https://raw.githubusercontent.com/kswarrior/ks-panel-plugin-store/refs/heads/main/list.json', (resp) => {
      let data = '';
      resp.on('data', (chunk) => { data += chunk; });
      resp.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

// ────────────────────────────────────────────────
// Management & Permissions
// ────────────────────────────────────────────────

router.get("/admin/plugins/overview/:name/download", isAdmin, async (req, res) => {
  try {
    const pluginName = req.params.name;
    const pluginPath = path.join(pluginsDir, pluginName);
    if (!fs.existsSync(pluginPath)) return res.status(404).send("Plugin not found.");

    const zip = new AdmZip();
    zip.addLocalFolder(pluginPath);
    const buffer = zip.toBuffer();

    res.set('Content-Type', 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename=${pluginName}.kspp`);
    res.set('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    log.error(`Error downloading plugin: ${error.message}`);
    res.status(500).send("Export failed.");
  }
});

router.post("/admin/plugins/overview/:name/permissions/update", isAdmin, async (req, res) => {
  try {
    const pluginName = req.params.name;
    const { approved_permissions } = req.body;
    const pluginsJson = await readPluginsJson();

    if (!pluginsJson[pluginName]) return res.status(404).send("Plugin config not found.");

    pluginsJson[pluginName].approved_permissions = Array.isArray(approved_permissions) ? approved_permissions : (approved_permissions ? [approved_permissions] : []);
    await writePluginsJson(pluginsJson);

    res.redirect("/admin/plugins/overview?success=PERMS_UPDATED");
  } catch (error) {
    log.error(`Error updating permissions: ${error.message}`);
    res.status(500).send("Update failed.");
  }
});

// ────────────────────────────────────────────────
// Existing admin routes
// ────────────────────────────────────────────────

router.get("/admin/plugins/overview", isAdmin, async (req, res) => {
  const pluginsJson = await readPluginsJson();

  const enrichedPlugins = pluginList.map(p => ({
    ...p,
    enabled: pluginsJson[p.name]?.enabled || false,
    approved_permissions: pluginsJson[p.name]?.approved_permissions || []
  }));

  const enabledPlugins = enrichedPlugins.filter((plugin) => plugin.enabled);

  res.render("admin/plugins/overview", {
    req,
    user: req.user,
    plugins: enrichedPlugins,
    pluginSidebar,
    enabledPlugins,
  });
});

router.post("/admin/plugins/overview/:name/toggle", isAdmin, async (req, res) => {
  try {
    const name = req.params.name;
    const pluginsJson = await readPluginsJson();

    if (pluginsJson[name]) {
      const newEnabled = !pluginsJson[name].enabled;
      pluginsJson[name].enabled = newEnabled;
      await writePluginsJson(pluginsJson);

      if (!newEnabled) {
        const pluginPath = path.join(pluginsDir, name);
        const manifest = JSON.parse(fs.readFileSync(path.join(pluginPath, 'manifest.json'), 'utf8'));
        const pluginModule = require(path.join(pluginPath, manifest.main));
        if (typeof pluginModule.unregister === "function") {
          pluginModule.unregister({ app: appInstance, db: dbInstance, events });
        }
      }

      await loadAndActivatePlugins();
    }
    res.send("OK");
  } catch (error) {
    log.error(`Error toggling plugin ${name}: ${error.message}`);
    res.status(500).send("An error occurred. Please try again later.");
  }
});

router.get("/admin/plugins/overview/:dir/edit", isAdmin, async (req, res) => {
  try {
    const dir = req.params.dir;
    const pluginPath = path.join(pluginsDir, dir);
    const manifestPath = path.join(pluginPath, "manifest.json");
    const manifest = JSON.parse(await fs.promises.readFile(manifestPath, "utf8"));

    const getFiles = (subdir) => {
      const p = path.join(pluginPath, subdir);
      if (!fs.existsSync(p)) return [];
      return fs.readdirSync(p).map(f => ({ name: f, content: fs.readFileSync(path.join(p, f), 'utf8') }));
    };

    const architectureStack = {
      fe: getFiles('views'),
      be: getFiles('router')
    };

    res.render("admin/plugins/editor", {
      req,
      user: req.user,
      pluginSidebar,
      dir,
      content: manifestJson,
    });
  } catch (error) {
    log.error(`Error loading plugin edit page: ${error.message}`);
    res.status(500).send("An error occurred. Please try again later.");
  }
});

router.post("/admin/plugins/overview/:dir/save", isAdmin, async (req, res) => {
  try {
    const dir = req.params.dir;
    const pluginPath = path.join(pluginsDir, dir);
    const {
      fe_filenames, fe_contents,
      be_filenames, be_contents,
      manifest_json
    } = req.body;

    if (manifest_json) fs.writeFileSync(path.join(pluginPath, 'manifest.json'), manifest_json);

    if (fe_filenames) {
      const names = Array.isArray(fe_filenames) ? fe_filenames : [fe_filenames];
      const contents = Array.isArray(fe_contents) ? fe_contents : [fe_contents];
      names.forEach((fn, i) => fs.writeFileSync(path.join(pluginPath, 'views', fn), contents[i]));
    }

    if (be_filenames) {
      const names = Array.isArray(be_filenames) ? be_filenames : [be_filenames];
      const contents = Array.isArray(be_contents) ? be_contents : [be_contents];
      names.forEach((fn, i) => fs.writeFileSync(path.join(pluginPath, 'router', fn), contents[i]));
    }

    await loadAndActivatePlugins();
    res.redirect(`/admin/plugins/overview/${dir}/edit?success=SAVED`);
  } catch (error) {
    log.error(`Error saving plugin ${dir}: ${error.message}`);
    res.status(500).send("An error occurred. Please try again later.");
  }
});

router.post("/admin/plugins/overview/reload", isAdmin, async (req, res) => {
  try {
    await loadAndActivatePlugins();
    res.redirect("/admin/plugins/overview");
  } catch (error) {
    log.error(`Error reloading plugins: ${error.message}`);
    res.status(500).send("An error occurred. Please try again later.");
  }
});

// ────────────────────────────────────────────────
// Plugin Store – improved filtering
// ────────────────────────────────────────────────

router.get("/admin/plugins/store", isAdmin, async (req, res) => {
  try {
    let storePlugins = await fetchStorePlugins();
    let filtered = storePlugins;

    const {
      search,
      category,
      min_version,
      price_filter = 'all',
      min_price
    } = req.query;

    // Search
    if (search?.trim()) {
      const term = search.toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.name || '').toLowerCase().includes(term) ||
        (p.author || '').toLowerCase().includes(term) ||
        (p.category || '').toLowerCase().includes(term)
      );
    }

    // Category
    if (category && category !== '') {
      filtered = filtered.filter(p => p.category === category);
    }

    // Min version (simple string compare – consider semver for production)
    if (min_version) {
      filtered = filtered.filter(p => (p.version || '0.0.0') >= min_version);
    }

    // Price filtering – matches your requested UI options
    const minPriceValue = parseFloat(min_price) || 0;

    if (price_filter === 'free') {
      filtered = filtered.filter(p => p.price === 'free' || p.price == 0 || !p.price);
    }
    else if (price_filter === 'limit') {
      filtered = filtered.filter(p => {
        if (p.price === 'free' || !p.price) return false;
        const numericPrice = parseFloat(p.price);
        return !isNaN(numericPrice) && numericPrice >= minPriceValue;
      });
    }
    // 'all' → no price filter

    const allCategories = [...new Set(storePlugins.map(p => p.category).filter(Boolean))].sort();

    const installedNames = pluginList.map(p => p.name);

    res.render("admin/plugins/store", {
      req,
      user: req.user,
      plugins: filtered,
      categories: allCategories,
      pluginSidebar,
      currentFilters: req.query,
      installedNames
    });
  } catch (error) {
    log.error(`Error loading store: ${error.message}`);
    res.status(500).send("An error occurred while loading the plugin store.");
  }
});

router.post("/admin/plugins/store/install", isAdmin, async (req, res) => {
  const { download_url } = req.body;
  try {
    const tempPath = path.join(pluginsDir, 'temp.kspp');
    const file = fs.createWriteStream(tempPath);

    await new Promise((resolve, reject) => {
      https.get(download_url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }).on('error', (err) => {
        fs.unlink(tempPath, () => reject(err));
      });
      file.on('error', (err) => {
        fs.unlink(tempPath, () => reject(err));
      });
    });

    await installFromKspp(tempPath);
    fs.unlinkSync(tempPath);

    res.redirect("/admin/plugins/store?success=1");
  } catch (error) {
    log.error(`Error installing from store: ${error.message}`);
    res.status(500).send("Installation failed. Please try again.");
  }
});

router.post("/admin/plugins/upload", isAdmin, upload.single('plugin'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded.");
    await installFromKspp(req.file.path);
    fs.unlinkSync(req.file.path);
    res.redirect("/admin/plugins/overview?success=UPLOADED");
  } catch (error) {
    log.error(`Error uploading plugin: ${error.message}`);
    res.status(500).send("Plugin upload failed.");
  }
});

router.get("/admin/plugins/studio/src", isAdmin, async (req, res) => {
  try {
    const { type, file } = req.query;
    if (!type || !file) return res.status(400).send("Missing parameters.");

    const baseDir = type === "view" ? path.join(__dirname, "../views") : path.join(__dirname, "../routes");
    const fullPath = path.join(baseDir, file);

    if (!fullPath.startsWith(baseDir)) return res.status(403).send("Forbidden.");
    if (!fs.existsSync(fullPath)) return res.status(404).send("File not found.");

    const content = await fs.promises.readFile(fullPath, "utf8");
    res.json({ content });
  } catch (error) {
    res.status(500).send("Error reading file.");
  }
});

router.get("/admin/plugins/studio", isAdmin, async (req, res) => {
  const viewsDir = path.join(__dirname, "../views");
  const routesDir = path.join(__dirname, "../routes");

  const getFiles = (dir, base = "") => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      const relativePath = path.join(base, file);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFiles(fullPath, relativePath));
      } else if (file.endsWith(".ejs") || file.endsWith(".js")) {
        results.push(relativePath);
      }
    });
    return results;
  };

  res.render("admin/plugins/studio", {
    req,
    user: req.user,
    pluginSidebar,
    views: getFiles(viewsDir),
    routes: getFiles(routesDir)
  });
});

router.post("/admin/plugins/studio/create", isAdmin, async (req, res) => {
  const {
    name, type, category, version, description,
    sidebar_category, sidebar_name, sidebar_route, sidebar_icon,
    import_views, import_routes,
    custom_code, custom_code_type,
    dependencies, hooks, permissions
  } = req.body;

  try {
    const dirName = name.toLowerCase().replace(/ /g, "_").replace(/[^a-z0-9_]/g, "");
    const pluginPath = path.join(pluginsDir, dirName);

    if (fs.existsSync(pluginPath)) return res.status(400).send("Plugin directory already exists.");

    fs.mkdirSync(pluginPath, { recursive: true });
    fs.mkdirSync(path.join(pluginPath, "router"), { recursive: true });
    fs.mkdirSync(path.join(pluginPath, "views"), { recursive: true });

    // Build sidebar manifest
    const adminsidebar = {};
    if (sidebar_name) {
      const names = Array.isArray(sidebar_name) ? sidebar_name : [sidebar_name];
      const cats = Array.isArray(sidebar_category) ? sidebar_category : [sidebar_category];
      const routes = Array.isArray(sidebar_route) ? sidebar_route : [sidebar_route];
      const icons = Array.isArray(sidebar_icon) ? sidebar_icon : [sidebar_icon];

      names.forEach((sName, index) => {
        if (!sName) return;
        const sCat = cats[index] || "Plugins";
        const sRoute = routes[index] || dirName;

        if (!adminsidebar[sCat]) adminsidebar[sCat] = [];
        adminsidebar[sCat].push({
          name: sName,
          icon: icons[index] || "puzzle-piece",
          link: `/plugins/${sRoute}`
        });
      });
    }

    const manifest = {
      name,
      type: type || "extension",
      category: category || "General",
      version: version || "1.0.0",
      description: description || "Scaffolded with KS Studio.",
      main: "router/index.js",
      router: dirName,
      adminsidebar,
      dependencies: dependencies ? (Array.isArray(dependencies) ? dependencies.filter(d => d.trim() !== '') : [dependencies]) : [],
      hooks: hooks ? (Array.isArray(hooks) ? hooks : [hooks]) : [],
      permissions: permissions ? (Array.isArray(permissions) ? permissions : [permissions]) : []
    };

    fs.writeFileSync(path.join(pluginPath, "manifest.json"), JSON.stringify(manifest, null, 2));

    // Handle Structured Files (Scaffolding Logic)
    const {
      fe_filenames, fe_contents,
      be_filenames, be_contents
    } = req.body;

    // Handle Scaffolding Uploads (from multi-file input)
    if (req.files) {
      // Logic for handling scaffolds with uploaded files
    }

    if (fe_filenames) {
       const names = Array.isArray(fe_filenames) ? fe_filenames : [fe_filenames];
       const contents = Array.isArray(fe_contents) ? fe_contents : [fe_contents];
       names.forEach((fname, i) => {
         if (fname) fs.writeFileSync(path.join(pluginPath, "views", fname.endsWith('.ejs') ? fname : fname + '.ejs'), contents[i] || '');
       });
    }

    if (be_filenames) {
       const names = Array.isArray(be_filenames) ? be_filenames : [be_filenames];
       const contents = Array.isArray(be_contents) ? be_contents : [be_contents];
       names.forEach((fname, i) => {
         if (fname) fs.writeFileSync(path.join(pluginPath, "router", fname.endsWith('.js') ? fname : fname + '.js'), contents[i] || '');
       });
    }

    // Default Fallbacks if no structured files provided
    if (!be_filenames) {
      let routerContent = `const express = require('express');\nconst router = express.Router();\n\nrouter.get('/', (req, res) => {\n  res.render('../views/index', { req, user: req.user });\n});\n\nmodule.exports = router;`;
      if (custom_code && custom_code_type === 'javascript') routerContent = custom_code;
      fs.writeFileSync(path.join(pluginPath, "router/index.js"), routerContent);
    }

    if (!fe_filenames) {
      let viewContent = `<%- include('../../../panel/views/components/template') %>\n<main id="content" class="animate-fade-in px-4 sm:px-6 lg:px-8 pt-8 pb-12">\n  <div class="glass p-12 rounded-3xl border border-white/10 text-center">\n    <div class="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 mx-auto mb-6">\n       <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path></svg>\n    </div>\n    <h1 class="text-4xl font-black text-white mb-4">${name}</h1>\n    <p class="text-neutral-400 max-w-md mx-auto">${description || 'Welcome to your new custom plugin page.'}</p>\n  </div>\n</main>\n<%- include('../../../panel/views/components/footer') %>`;
      if (custom_code && custom_code_type === 'html') viewContent = custom_code;
      fs.writeFileSync(path.join(pluginPath, "views/index.ejs"), viewContent);
    }

    // Import logic
    if (import_views && Array.isArray(import_views)) {
      import_views.forEach(v => {
        const src = path.join(__dirname, "../views", v);
        const dest = path.join(pluginPath, "views", path.basename(v));
        if (fs.existsSync(src)) fs.copyFileSync(src, dest);
      });
    }

    if (import_routes && Array.isArray(import_routes)) {
      import_routes.forEach(r => {
        const src = path.join(__dirname, "../routes", r);
        const dest = path.join(pluginPath, "router", path.basename(r));
        if (fs.existsSync(src)) fs.copyFileSync(src, dest);
      });
    }

    const pluginsJson = await readPluginsJson();
    pluginsJson[name] = { enabled: true };
    await writePluginsJson(pluginsJson);

    await loadAndActivatePlugins();
    res.redirect("/admin/plugins/overview?success=CREATED");
  } catch (error) {
    log.error(`Error creating plugin via Studio: ${error.message}`);
    res.status(500).send("Plugin creation failed.");
  }
});

// ────────────────────────────────────────────────
// Error handling & startup
// ────────────────────────────────────────────────

process.on("uncaughtException", (error) => {
  log.error(`Uncaught Exception: ${error.message}`);
});

process.on("unhandledRejection", (reason, promise) => {
  log.error(
    `Unhandled Rejection at: ${promise} reason: ${reason.message || reason}`
  );
});

loadAndActivatePlugins();

const pluginSidebarloader = () => pluginSidebar;

module.exports.pluginSidebar = pluginSidebarloader;
module.exports = router;
