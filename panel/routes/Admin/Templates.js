const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const { isAdmin, hasPermission } = require("../../utils/isAdmin.js");
const { logAudit } = require("../../handlers/auditLog.js");

const log = new (require("cat-loggr"))();

const TEMPLATES_DIR = path.join(__dirname, "../../../database/templates");

if (!fs.existsSync(TEMPLATES_DIR)) {
  fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
}

const CATEGORIES_FILE = path.join(TEMPLATES_DIR, "categories.json");
const TYPES_FILE = path.join(TEMPLATES_DIR, "types.json");

// Initialize default categories
if (!fs.existsSync(CATEGORIES_FILE)) {
  fs.writeFileSync(
    CATEGORIES_FILE,
    JSON.stringify(["Minecraft", "Node.js", "Python", "Other"], null, 2),
    "utf8"
  );
}

// Initialize default types
if (!fs.existsSync(TYPES_FILE)) {
  fs.writeFileSync(
    TYPES_FILE,
    JSON.stringify(["Standard Application", "Game Server", "Database Engine", "Custom Power Template"], null, 2),
    "utf8"
  );
}

// ────────────────────────────────────────────────
// Helper functions
// ────────────────────────────────────────────────

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    log.error(`Failed to parse JSON at ${filePath}`, err);
    return null;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function getDirName(name) {
  if (!name || typeof name !== "string") return "";
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Load template data including full page content for editing
function loadTemplate(dirName) {
  const dirPath = path.join(TEMPLATES_DIR, dirName);
  const mainPath = path.join(dirPath, "main.json");

  if (!fs.existsSync(mainPath)) return null;

  const mainData = readJson(mainPath);
  if (!mainData) return null;

  const template = {
    filename: dirName,   // folder name = identifier
    ...mainData,
    pages: []
  };

  const pagesDir = path.join(dirPath, "pages");
  if (fs.existsSync(pagesDir)) {
    const files = fs.readdirSync(pagesDir);
    template.pages = files
      .filter(f => f.endsWith(".ejs"))
      .map(file => {
        const id = file.replace(/\.ejs$/, "");
        const ejsPath = path.join(pagesDir, file);
        const jsPath = path.join(pagesDir, `${id}.js`);

        return {
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " "),
          ejsContent: fs.existsSync(ejsPath) ? fs.readFileSync(ejsPath, "utf8") : "",
          jsContent: fs.existsSync(jsPath) ? fs.readFileSync(jsPath, "utf8") : ""
        };
      });
  }

  return template;
}

// ────────────────────────────────────────────────
// OVERVIEW ─ list all templates
// ────────────────────────────────────────────────

router.get("/admin/templates/overview", hasPermission("manage_templates"), (req, res) => {
  const categories = readJson(CATEGORIES_FILE) || [];
  const types = readJson(TYPES_FILE) || [];
  const search = req.query.search || "";
  const categoryFilter = req.query.category || "";
  const typeFilter = req.query.type || "";

  const dirs = fs.readdirSync(TEMPLATES_DIR).filter(entry => {
    return fs.statSync(path.join(TEMPLATES_DIR, entry)).isDirectory();
  });

  let templates = dirs
    .map(dir => loadTemplate(dir))
    .filter(Boolean);

  // Apply filters
  if (search || categoryFilter || typeFilter) {
    templates = templates.filter(t => {
      const searchMatch = !search ||
        t.meta.name.toLowerCase().includes(search.toLowerCase()) ||
        t.filename.toLowerCase().includes(search.toLowerCase());
      const categoryMatch = !categoryFilter || t.category === categoryFilter;
      const typeMatch = !typeFilter || t.meta.type === typeFilter;
      return searchMatch && categoryMatch && typeMatch;
    });
  }

  // Handle pagination for templates
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 12;
  const { paginate } = require("../../utils/dbHelper.js");
  const result = paginate(templates, page, pageSize);

  res.render("admin/templates/overview", {
    req,
    user: req.user,
    templates: result.data,
    pagination: result.pagination,
    categories,
    types,
    filters: { search, category: categoryFilter, type: typeFilter }
  });
});

// ────────────────────────────────────────────────
// CREATE page
// ────────────────────────────────────────────────

router.get("/admin/templates/create", hasPermission("manage_templates"), (req, res) => {
  const categories = readJson(CATEGORIES_FILE) || [];
  const types = readJson(TYPES_FILE) || [];
  res.render("admin/templates/create", { req, user: req.user, categories, types });
});

// ────────────────────────────────────────────────
// EDIT page ─ loads full content (main + pages/*.ejs & .js)
// ────────────────────────────────────────────────

router.get("/admin/templates/edit/:dirName", hasPermission("manage_templates"), (req, res) => {
  const { dirName } = req.params;
  const template = loadTemplate(dirName);

  if (!template) {
    return res.status(404).send("Template folder not found");
  }

  const categories = readJson(CATEGORIES_FILE) || [];
  const types = readJson(TYPES_FILE) || [];

  res.render("admin/templates/edit", {
    req,
    user: req.user,
    template,
    categories,
    types,
    filename: dirName   // folder name
  });
});

// ────────────────────────────────────────────────
// ADD / CREATE TYPE
// ────────────────────────────────────────────────

router.post("/admin/templates/type", hasPermission("manage_templates"), (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Name required" });

  let types = readJson(TYPES_FILE) || [];
  const trimmed = name.trim();

  if (types.includes(trimmed)) {
    return res.status(400).json({ error: "Type already exists" });
  }

  types.push(trimmed);
  writeJson(TYPES_FILE, types);

  logAudit(req.user.userId, req.user.username, "template:type:add", req.ip);

  res.json({ success: true, types: types });
});

// ────────────────────────────────────────────────
// DELETE TYPE
// ────────────────────────────────────────────────

router.delete("/admin/templates/type", hasPermission("manage_templates"), (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  let types = readJson(TYPES_FILE) || [];
  const index = types.indexOf(name);

  if (index === -1) {
    return res.status(404).json({ error: "Type not found" });
  }

  types.splice(index, 1);
  writeJson(TYPES_FILE, types);

  logAudit(req.user.userId, req.user.username, "template:type:delete", req.ip);

  res.json({ success: true, types: types });
});

// ────────────────────────────────────────────────
// ADD / CREATE CATEGORY
// ────────────────────────────────────────────────

router.post("/admin/templates/category", hasPermission("manage_templates"), (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Name required" });

  let cats = readJson(CATEGORIES_FILE) || [];
  const trimmed = name.trim();

  if (cats.includes(trimmed)) {
    return res.status(400).json({ error: "Category already exists" });
  }

  cats.push(trimmed);
  writeJson(CATEGORIES_FILE, cats);

  logAudit(req.user.userId, req.user.username, "template:category:add", req.ip);

  res.json({ success: true, categories: cats });
});

// ────────────────────────────────────────────────
// DELETE CATEGORY
// ────────────────────────────────────────────────

router.delete("/admin/templates/category", hasPermission("manage_templates"), (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  let cats = readJson(CATEGORIES_FILE) || [];
  const index = cats.indexOf(name);

  if (index === -1) {
    return res.status(404).json({ error: "Category not found" });
  }

  cats.splice(index, 1);
  writeJson(CATEGORIES_FILE, cats);

  logAudit(req.user.userId, req.user.username, "template:category:delete", req.ip);

  res.json({ success: true, categories: cats });
});

// ────────────────────────────────────────────────
// CREATE new template (folder + main.json + pages files)
// ────────────────────────────────────────────────

router.post("/admin/templates", hasPermission("manage_templates"), (req, res) => {
  try {
    const { meta, category, environment, variables = [], actions = [], install_steps = [], security = {}, pages = [], features = {} } = req.body;

    if (!meta?.name?.trim() || !category || !environment?.docker_image) {
      return res.status(400).json({ error: "Missing required fields: name, category, docker_image" });
    }

    const dirName = getDirName(meta.name);
    if (!dirName) {
      return res.status(400).json({ error: "Invalid template name" });
    }

    const dirPath = path.join(TEMPLATES_DIR, dirName);

    if (fs.existsSync(dirPath)) {
      return res.status(409).json({ error: "Template folder already exists" });
    }

    fs.mkdirSync(dirPath, { recursive: true });
    fs.mkdirSync(path.join(dirPath, "pages"), { recursive: true });

    // Save main.json
    writeJson(path.join(dirPath, "main.json"), {
      meta,
      category,
      environment,
      variables,
      actions,
      install_steps,
      security,
      features,
      pages: pages.map(p => ({ id: p.id, type: p.type, name: p.name, config: p.config })) // Metadata only
    });

    // Save page files (EJS/JS)
    pages.forEach(p => {
      if (!p.id?.trim()) return;
      const safeId = p.id.trim().replace(/[^a-z0-9_-]/gi, "");

      if (p.ejsContent?.trim()) {
        fs.writeFileSync(
          path.join(dirPath, "pages", `${safeId}.ejs`),
          p.ejsContent,
          "utf8"
        );
      }

      if (p.jsContent?.trim()) {
        fs.writeFileSync(
          path.join(dirPath, "pages", `${safeId}.js`),
          p.jsContent,
          "utf8"
        );
      }
    });

    logAudit(req.user.userId, req.user.username, "template:create", req.ip);

    res.json({ success: true, filename: dirName });
  } catch (err) {
    log.error("Template creation failed", err);
    res.status(500).json({ error: "Failed to create template" });
  }
});

// ────────────────────────────────────────────────
// UPDATE template (rename folder if needed + rewrite pages)
// ────────────────────────────────────────────────

router.put("/admin/templates/:dirName", hasPermission("manage_templates"), (req, res) => {
  try {
    const oldDirName = req.params.dirName;
    const oldDirPath = path.join(TEMPLATES_DIR, oldDirName);

    if (!fs.existsSync(oldDirPath)) {
      return res.status(404).json({ error: "Template not found" });
    }

    const { meta, category, environment, variables = [], actions = [], install_steps = [], security = {}, pages = [], features = {} } = req.body;

    if (!meta?.name?.trim()) {
      return res.status(400).json({ error: "Template name is required" });
    }

    const newDirName = getDirName(meta.name);
    let finalDirPath = oldDirPath;

    // Rename folder if name changed
    if (newDirName !== oldDirName) {
      const newDirPath = path.join(TEMPLATES_DIR, newDirName);
      if (fs.existsSync(newDirPath)) {
        return res.status(409).json({ error: "New name already taken" });
      }
      fs.renameSync(oldDirPath, newDirPath);
      finalDirPath = newDirPath;
    }

    const pagesDir = path.join(finalDirPath, "pages");
    if (!fs.existsSync(pagesDir)) {
      fs.mkdirSync(pagesDir, { recursive: true });
    }

    // Update main.json
    writeJson(path.join(finalDirPath, "main.json"), {
      meta,
      category,
      environment,
      variables,
      actions,
      install_steps,
      security,
      features,
      pages: pages.map(p => ({ id: p.id, type: p.type, name: p.name, config: p.config }))
    });

    // Clear old page files
    if (fs.existsSync(pagesDir)) {
      fs.readdirSync(pagesDir).forEach(file => {
        fs.unlinkSync(path.join(pagesDir, file));
      });
    }

    // Write new page files
    pages.forEach(p => {
      if (!p.id?.trim()) return;
      const safeId = p.id.trim().replace(/[^a-z0-9_-]/gi, "");

      if (p.ejsContent?.trim()) {
        fs.writeFileSync(
          path.join(pagesDir, `${safeId}.ejs`),
          p.ejsContent,
          "utf8"
        );
      }

      if (p.jsContent?.trim()) {
        fs.writeFileSync(
          path.join(pagesDir, `${safeId}.js`),
          p.jsContent,
          "utf8"
        );
      }
    });

    logAudit(req.user.userId, req.user.username, "template:update", req.ip);

    res.json({ success: true, filename: newDirName });
  } catch (err) {
    log.error("Template update failed", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// ────────────────────────────────────────────────
// DELETE entire template folder
// ────────────────────────────────────────────────

router.delete("/admin/templates/:dirName", hasPermission("manage_templates"), (req, res) => {
  const dirPath = path.join(TEMPLATES_DIR, req.params.dirName);

  if (!fs.existsSync(dirPath)) {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    logAudit(req.user.userId, req.user.username, "template:delete", req.ip);
    res.json({ success: true });
  } catch (err) {
    log.error("Delete failed", err);
    res.status(500).json({ error: "Failed to delete template" });
  }
});

// ────────────────────────────────────────────────
// DOWNLOAD main.json only (for backward compatibility / simple export)
// ────────────────────────────────────────────────

router.get("/admin/templates/download/:dirName", hasPermission("manage_templates"), (req, res) => {
  const mainPath = path.join(TEMPLATES_DIR, req.params.dirName, "main.json");

  if (fs.existsSync(mainPath)) {
    res.download(mainPath, `${req.params.dirName}-main.json`);
  } else {
    res.status(404).send("Not found");
  }
});

module.exports = router;
