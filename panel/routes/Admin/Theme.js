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
  '--font-family': "'Plus Jakarta Sans', sans-serif"
};

router.get("/admin/settings/theme", hasPermission('manage_settings'), async (req, res) => {
  try {
    const settings = (await db.get("settings")) || {};
    let theme = (await db.get("theme")) || {};

    // Ensure all variables are present
    theme = { ...SYSTEM_DEFAULT_THEME, ...theme };

    res.render("admin/settings/theme", {
      req,
      user: req.user,
      settings,
      theme
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

    // Only update allowed variables (starting with --)
    Object.keys(themeData).forEach(key => {
      if (key.startsWith('--')) {
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

module.exports = router;
