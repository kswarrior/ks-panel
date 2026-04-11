const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const { isAdmin } = require("../../utils/isAdmin.js");
const { logAudit } = require("../../handlers/auditLog.js");

const log = new (require("cat-loggr"))();

const TEMPLATES_DIR = path.join(__dirname, "../../../database/templates");

if (!fs.existsSync(TEMPLATES_DIR)) {
  fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
}

const CATEGORIES_FILE = path.join(TEMPLATES_DIR, "categories.json");

// Initialize default categories
if (!fs.existsSync(CATEGORIES_FILE)) {
  fs.writeFileSync(
    CATEGORIES_FILE,
    JSON.stringify(["Minecraft", "Node.js", "Python", "Other"], null, 2),
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

router.get("/admin/templates/overview", isAdmin, (req, res) => {
  const categories = readJson(CATEGORIES_FILE) || [];

  const dirs = fs.readdirSync(TEMPLATES_DIR).filter(entry => {
    return fs.statSync(path.join(TEMPLATES_DIR, entry)).isDirectory();
  });

  const templates = dirs
    .map(dir => loadTemplate(dir))
    .filter(Boolean);

  res.render("admin/templates/overview", {
    req,
    user: req.user,
    templates,
    categories
  });
});

// ────────────────────────────────────────────────
// CREATE page
// ────────────────────────────────────────────────

router.get("/admin/templates/create", isAdmin, (req, res) => {
  const categories = readJson(CATEGORIES_FILE) || [];
  res.render("admin/templates/create", { req, user: req.user, categories });
});

// ────────────────────────────────────────────────
// EDIT page ─ loads full content (main + pages/*.ejs & .js)
// ────────────────────────────────────────────────

router.get("/admin/templates/edit/:dirName", isAdmin, (req, res) => {
  const { dirName } = req.params;
  const template = loadTemplate(dirName);

  if (!template) {
    return res.status(404).send("Template folder not found");
  }

  const categories = readJson(CATEGORIES_FILE) || [];

  res.render("admin/templates/edit", {
    req,
    user: req.user,
    template,
    categories,
    filename: dirName   // folder name
  });
});

// ────────────────────────────────────────────────
// ADD / CREATE CATEGORY
// ────────────────────────────────────────────────

router.post("/admin/templates/category", isAdmin, (req, res) => {
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
// CREATE new template (folder + main.json + pages files)
// ────────────────────────────────────────────────

router.post("/admin/templates", isAdmin, (req, res) => {
  try {
    const { meta, category, environment, variables = [], actions = [], install_steps = [], pages = [] } = req.body;

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

    // Save main.json (without pages array)
    writeJson(path.join(dirPath, "main.json"), {
      meta,
      category,
      environment,
      variables,
      actions,
      install_steps
    });

    // Save page files
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

router.put("/admin/templates/:dirName", isAdmin, (req, res) => {
  try {
    const oldDirName = req.params.dirName;
    const oldDirPath = path.join(TEMPLATES_DIR, oldDirName);

    if (!fs.existsSync(oldDirPath)) {
      return res.status(404).json({ error: "Template not found" });
    }

    const { meta, category, environment, variables = [], actions = [], install_steps = [], pages = [] } = req.body;

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
      install_steps
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

router.delete("/admin/templates/:dirName", isAdmin, (req, res) => {
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

router.get("/admin/templates/download/:dirName", isAdmin, (req, res) => {
  const mainPath = path.join(TEMPLATES_DIR, req.params.dirName, "main.json");

  if (fs.existsSync(mainPath)) {
    res.download(mainPath, `${req.params.dirName}-main.json`);
  } else {
    res.status(404).send("Not found");
  }
});

module.exports = router;
