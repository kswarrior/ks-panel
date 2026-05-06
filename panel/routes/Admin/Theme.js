const express = require("express");
const router = express.Router();
const { db } = require("../../handlers/db.js");
const { logAudit } = require("../../handlers/auditLog.js");
const { isAdmin, hasPermission } = require("../../utils/isAdmin.js");
const log = new (require("cat-loggr"))();

const SYSTEM_DEFAULT_THEME = {
  '--accent-color': '#3b82f6',
  '--sidebar-bg': 'rgba(10, 10, 10, 0.6)',
  '--header-bg': 'rgba(10, 10, 10, 0.4)',
  '--glass-border': 'rgba(255, 255, 255, 0.08)',
  '--glass-blur': '16px',
  '--card-radius': '1.5rem',
  '--btn-radius': '0.75rem',
  '--card-padding': '2rem',
  '--sidebar-width': '16rem',
  '--sidebar-blur': '16px',
  '--sidebar-radius': '0rem',
  '--sidebar-margin': '0rem',
  '--sidebar-padding': '1.5rem',
  '--sidebar-font-size': '0.875rem',
  '--sidebar-text-color': '#9ca3af',
  '--sidebar-active-text': '#ffffff',
  '--card-bg': 'rgba(10, 10, 10, 0.6)',
  '--card-blur': '16px',
  '--card-border': 'rgba(255, 255, 255, 0.08)',
  '--card-radius': '1.5rem',
  '--card-padding': '2rem',
  '--card-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  '--btn-bg': '#3b82f6',
  '--btn-text': '#ffffff',
  '--btn-radius': '0.75rem',
  '--btn-padding-y': '0.75rem',
  '--btn-padding-x': '1.25rem',
  '--btn-font-size': '0.75rem',
  '--btn-shadow': '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
  '--input-bg': 'rgba(255, 255, 255, 0.05)',
  '--input-border': 'rgba(255, 255, 255, 0.1)',
  '--input-radius': '0.75rem',
  '--input-text': '#ffffff',
  '--header-blur': '16px',
  '--header-border': 'rgba(255, 255, 255, 0.08)',
  '--header-padding': '1rem 2rem',
  '--glow-intensity': '0 0 15px rgba(59, 130, 246, 0.5)',
  '--font-family': "'Plus Jakarta Sans', sans-serif",
  '--h1-size': '1.875rem',
  '--h1-margin': '0rem',
  '--h1-padding': '0rem',
  '--h2-size': '1.5rem',
  '--h2-margin': '0rem',
  '--h2-padding': '0rem',
  '--h3-size': '1.25rem',
  '--h3-margin': '0rem',
  '--h3-padding': '0rem',
  '--p-size': '0.875rem',
  '--p-margin': '0rem',
  '--p-padding': '0rem',
  '--pre-size': '0.75rem',
  '--pre-margin': '0rem',
  '--pre-padding': '0.5rem',
  'theme_name': 'Default Architecture',
  'theme_type': 'Glassmorphic',
  'theme_category': 'System',
  'custom_css': ''
};

router.get("/admin/settings/theme", hasPermission('manage_settings'), async (req, res) => {
  try {
    const settings = (await db.get("settings")) || {};
    let theme = (await db.get("theme")) || {};
    const themeLibrary = (await db.get("theme_library")) || [];

    // Ensure all variables are present
    theme = { ...SYSTEM_DEFAULT_THEME, ...theme };

    res.render("admin/settings/theme", {
      req,
      user: req.user,
      settings,
      theme,
      themeLibrary
    });
  } catch (error) {
    log.error("Error loading theme settings:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/admin/settings/theme/save", hasPermission('manage_settings'), async (req, res) => {
  try {
    const themeData = req.body;
    let theme = (await db.get("theme")) || {};

    // Only update allowed variables (starting with -- or specific fields)
    const allowedFields = ['custom_css', 'theme_name', 'theme_type', 'theme_category'];
    Object.keys(themeData).forEach(key => {
      if (key.startsWith('--') || allowedFields.includes(key)) {
        theme[key] = themeData[key];
      }
    });

    await db.set("theme", theme);
    logAudit(req.user.userId, req.user.username, "theme:edit", req.ip);

    res.redirect("/admin/settings/theme?msg=ThemeUpdated");
  } catch (error) {
    log.error("Error saving theme:", error);
    res.redirect("/admin/settings/theme?err=SaveFailed");
  }
});

router.post("/admin/settings/theme/reset", hasPermission('manage_settings'), async (req, res) => {
  try {
    await db.set("theme", SYSTEM_DEFAULT_THEME);
    logAudit(req.user.userId, req.user.username, "theme:reset", req.ip);
    res.status(200).json({ success: true });
  } catch (error) {
    log.error("Error resetting theme:", error);
    res.status(500).json({ error: "Reset failed" });
  }
});

router.post("/admin/settings/theme/library/save", hasPermission('manage_settings'), async (req, res) => {
  try {
    const { name, theme } = req.body;
    const currentTheme = theme || (await db.get("theme")) || SYSTEM_DEFAULT_THEME;
    const themeLibrary = (await db.get("theme_library")) || [];

    const newTheme = {
      id: Math.random().toString(36).substring(2, 11),
      name: name || `Theme ${themeLibrary.length + 1}`,
      config: currentTheme,
      active: false
    };

    themeLibrary.push(newTheme);
    await db.set("theme_library", themeLibrary);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save theme" });
  }
});

router.post("/admin/settings/theme/library/update", hasPermission('manage_settings'), async (req, res) => {
  try {
    const { id, name, theme } = req.body;
    let themeLibrary = (await db.get("theme_library")) || [];
    const themeIndex = themeLibrary.findIndex(t => t.id === id);

    if (themeIndex === -1) return res.status(404).json({ error: "Theme not found" });

    themeLibrary[themeIndex].name = name || themeLibrary[themeIndex].name;
    themeLibrary[themeIndex].config = theme;

    await db.set("theme_library", themeLibrary);

    // If this theme is currently active, update the main theme object too
    if (themeLibrary[themeIndex].active) {
      await db.set("theme", theme);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update theme" });
  }
});

router.post("/admin/settings/theme/library/activate", hasPermission('manage_settings'), async (req, res) => {
  try {
    const { id } = req.body;
    const themeLibrary = (await db.get("theme_library")) || [];
    const themeToActivate = themeLibrary.find(t => t.id === id);

    if (!themeToActivate) return res.status(404).json({ error: "Theme not found" });

    themeLibrary.forEach(t => t.active = (t.id === id));
    await db.set("theme_library", themeLibrary);
    await db.set("theme", themeToActivate.config);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to activate theme" });
  }
});

router.post("/admin/settings/theme/library/delete", hasPermission('manage_settings'), async (req, res) => {
  try {
    const { id } = req.body;
    let themeLibrary = (await db.get("theme_library")) || [];
    themeLibrary = themeLibrary.filter(t => t.id !== id);
    await db.set("theme_library", themeLibrary);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete theme" });
  }
});

router.get("/admin/settings/theme/export/:id", hasPermission('manage_settings'), async (req, res) => {
  try {
    const { id } = req.params;
    const themeLibrary = (await db.get("theme_library")) || [];
    const theme = themeLibrary.find(t => t.id === id);

    if (!theme) return res.status(404).send("Theme not found");

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${theme.name.replace(/\s+/g, '_')}.json`);
    res.send(JSON.stringify(theme.config, null, 2));
  } catch (error) {
    res.status(500).send("Export failed");
  }
});

const multer = require('multer');
const upload = multer();

router.post("/admin/settings/theme/import", hasPermission('manage_settings'), upload.single('themeFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const themeConfig = JSON.parse(req.file.buffer.toString());
    const themeLibrary = (await db.get("theme_library")) || [];

    const newTheme = {
      id: Math.random().toString(36).substring(2, 11),
      name: req.file.originalname.replace('.json', '') || `Imported Theme ${themeLibrary.length + 1}`,
      config: themeConfig,
      active: false
    };

    themeLibrary.push(newTheme);
    await db.set("theme_library", themeLibrary);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Import failed: " + error.message });
  }
});

module.exports = router;
