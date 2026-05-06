const express = require("express");
const router = express.Router();
const { db } = require("../../handlers/db.js");
const { logAudit } = require("../../handlers/auditLog.js");
const { isAdmin, hasPermission } = require("../../utils/isAdmin.js");
const log = new (require("cat-loggr"))();

const SYSTEM_DEFAULT_THEME = {
  'theme_name': 'KS Default',
  'theme_type': 'Glassmorphic',
  'theme_category': 'System',
  '--bg-url-dashboard': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
  '--bg-url-auth': 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2670&auto=format&fit=crop',
  '--bg-url-admin': 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2535&auto=format&fit=crop',
  '--accent-color': '#3b82f6',
  '--font-family': "'Plus Jakarta Sans', sans-serif",
  '--header-bg': 'rgba(10, 10, 10, 0.04)',
  '--glow-intensity': '0 0 15px rgba(59, 130, 246, 0.5)',
  '--sidebar-bg': 'rgba(10, 10, 10, 0.04)',
  '--sidebar-text-color': '#9ca3af',
  '--sidebar-active-text': '#ffffff',
  '--sidebar-width': '13.5rem',
  '--sidebar-blur': '28px',
  '--sidebar-margin': '0rem',
  '--sidebar-radius': '0rem',
  '--sidebar-padding': '0rem',
  '--sidebar-font-size': '0.875rem',
  '--card-bg': 'rgba(10, 10, 10, 0.04)',
  '--card-border': 'rgba(255, 255, 255, 0.04)',
  '--card-padding': '1.25rem',
  '--card-radius': '1.5rem',
  '--card-blur': '9px',
  '--card-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  '--card-hover-shadow': '0 30px 60px -12px rgba(0, 0, 0, 0.6)',
  '--card-hover-transform': 'translateY(-4px)',
  '--btn-bg': '#3b82f6',
  '--btn-text': '#ffffff',
  '--btn-radius': '0.75rem',
  '--btn-font-size': '0.75rem',
  '--btn-padding-y': '1rem',
  '--btn-padding-x': '1rem',
  '--btn-hover-bg': '#2563eb',
  '--btn-hover-shadow': '0 15px 20px -3px rgba(59, 130, 246, 0.4)',
  '--btn-active-transform': 'scale(0.98)',
  '--input-bg': 'rgba(255, 255, 255, 0.04)',
  '--input-border': 'rgba(255, 255, 255, 0.04)',
  '--input-text': '#ffffff',
  '--input-radius': '0.75rem',
  '--glass-blur': '10px',
  '--anim-speed-fast': '0.2s',
  '--anim-speed-medium': '0.4s',
  '--anim-speed-slow': '0.8s',
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
  'custom_css': '',
  'card_custom_css': '',
  'button_custom_css': ''
};

router.get("/admin/settings/theme", hasPermission('manage_settings'), async (req, res) => {
  try {
    const settings = (await db.get("settings")) || {};
    let theme = (await db.get("theme")) || {};
    const themeLibrary = (await db.get("theme_library")) || [];

    // Ensure all variables are present
    theme = { ...SYSTEM_DEFAULT_THEME, ...theme };

    // Ensure system themes exist in library
    if (!themeLibrary.some(t => t.id === 'system-default')) {
      themeLibrary.unshift({
        id: 'system-default',
        name: 'System Default',
        config: SYSTEM_DEFAULT_THEME,
        active: false
      });
    }

    if (!themeLibrary.some(t => t.id === 'oled-black')) {
      themeLibrary.push({
        id: 'oled-black',
        name: 'OLED Black',
        config: { ...SYSTEM_DEFAULT_THEME, '--card-bg': '#000000', '--sidebar-bg': '#000000', '--header-bg': '#000000', '--glass-blur': '0px', '--card-border': 'rgba(255,255,255,0.1)' },
        active: false
      });
    }

    if (!themeLibrary.some(t => t.id === 'vibrant-indigo')) {
      themeLibrary.push({
        id: 'vibrant-indigo',
        name: 'Vibrant Indigo',
        config: { ...SYSTEM_DEFAULT_THEME, '--accent-color': '#6366f1', '--btn-bg': '#6366f1' },
        active: false
      });
    }

    if (!themeLibrary.some(t => t.id === 'spectral-mix')) {
      themeLibrary.push({
        id: 'spectral-mix',
        name: 'Spectral Mix',
        config: { ...SYSTEM_DEFAULT_THEME, '--accent-color': '#f43f5e', 'custom_css': 'body { background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop") !important; }' },
        active: false
      });
    }

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
    const allowedFields = ['custom_css', 'card_custom_css', 'button_custom_css', 'theme_name', 'theme_type', 'theme_category'];
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

    // Protect System Default
    if (themeLibrary[themeIndex].id === 'system-default') {
       return res.status(403).json({ error: "The System Default architecture is read-only." });
    }

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
    let themeToActivate;

    if (id === 'system-default') {
      themeToActivate = { id: 'system-default', config: SYSTEM_DEFAULT_THEME };
    } else {
      themeToActivate = themeLibrary.find(t => t.id === id);
    }

    if (!themeToActivate) return res.status(404).json({ error: "Theme not found" });

    // Update active status in library if it exists there
    const updatedLibrary = themeLibrary.map(t => ({
      ...t,
      active: t.id === id
    }));

    if (id === 'system-default') {
      // If activating system default, nothing in library is active
      updatedLibrary.forEach(t => t.active = false);
    }

    await db.set("theme_library", updatedLibrary);
    await db.set("theme", themeToActivate.config);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to activate theme" });
  }
});

router.post("/admin/settings/theme/library/delete", hasPermission('manage_settings'), async (req, res) => {
  try {
    const { id } = req.body;

    // Protect System Default
    if (id === 'system-default') {
       return res.status(403).json({ error: "The System Default architecture cannot be purged." });
    }

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
