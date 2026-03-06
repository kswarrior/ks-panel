const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const { isAdmin } = require("../../utils/isAdmin.js");
const { logAudit } = require("../../handlers/auditLog.js");

const log = new (require("cat-loggr"))();

const TEMPLATES_DIR = path.join(__dirname, "../../../database/templates");

if (!fs.existsSync(TEMPLATES_DIR)) fs.mkdirSync(TEMPLATES_DIR, { recursive: true });

const CATEGORIES_FILE = path.join(TEMPLATES_DIR, "categories.json");

// Initialize defaults
if (!fs.existsSync(CATEGORIES_FILE)) {
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(["Minecraft", "Node.js", "Python", "Other"], null, 2));
}

// Helpers
function readJson(file) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return []; } }
function writeJson(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

function getFilename(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + ".json";
}

// ====================== ROUTES ======================

// List page
router.get("/admin/templates/overview", isAdmin, (req, res) => {
  const categories = readJson(CATEGORIES_FILE);
  const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith(".json") && f !== "categories.json");

  const templates = files.map(file => {
    const data = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, file)));
    data.filename = file;
    return data;
  });

  res.render("admin/templates/overview", { req, user: req.user, templates, categories });
});

// Add category
router.post("/admin/templates/category", isAdmin, (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Name required" });

  const cats = readJson(CATEGORIES_FILE);
  if (cats.includes(name.trim())) return res.status(400).json({ error: "Already exists" });

  cats.push(name.trim());
  writeJson(CATEGORIES_FILE, cats);
  logAudit(req.user.userId, req.user.username, "template:category:add", req.ip);
  res.json({ success: true, categories: cats });
});

// Create template
router.post("/admin/templates", isAdmin, (req, res) => {
  try {
    const template = req.body;
    if (!template.meta?.name?.trim() || !template.category || !template.environment?.docker_image) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const filename = getFilename(template.meta.name);
    const filePath = path.join(TEMPLATES_DIR, filename);

    if (fs.existsSync(filePath)) return res.status(409).json({ error: "Template already exists" });

    writeJson(filePath, template);
    logAudit(req.user.userId, req.user.username, "template:create", req.ip);
    res.json({ success: true, filename });
  } catch (err) {
    log.error(err);
    res.status(500).json({ error: "Failed to create" });
  }
});

// Update template
router.put("/admin/templates/:filename", isAdmin, (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(TEMPLATES_DIR, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Not found" });

    const template = req.body;
    if (!template.meta?.name?.trim()) return res.status(400).json({ error: "Name required" });

    const newFilename = getFilename(template.meta.name);
    writeJson(filePath, template);

    if (newFilename !== filename) {
      const newPath = path.join(TEMPLATES_DIR, newFilename);
      if (fs.existsSync(newPath)) return res.status(409).json({ error: "Name already taken" });
      fs.renameSync(filePath, newPath);
      return res.json({ success: true, filename: newFilename });
    }

    logAudit(req.user.userId, req.user.username, "template:update", req.ip);
    res.json({ success: true, filename });
  } catch (err) {
    log.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

// Delete
router.delete("/admin/templates/:filename", isAdmin, (req, res) => {
  const filePath = path.join(TEMPLATES_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Not found" });

  fs.unlinkSync(filePath);
  logAudit(req.user.userId, req.user.username, "template:delete", req.ip);
  res.json({ success: true });
});

// Download
router.get("/admin/templates/download/:filename", isAdmin, (req, res) => {
  const filePath = path.join(TEMPLATES_DIR, req.params.filename);
  if (fs.existsSync(filePath)) res.download(filePath);
  else res.status(404).send("Not found");
});

module.exports = router;
