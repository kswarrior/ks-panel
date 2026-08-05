const express = require("express");
const router = express.Router();
const { db } = require("../../handlers/db.js");
const { logAudit } = require("../../handlers/auditLog.js");
const { isAdmin, hasPermission } = require("../../utils/isAdmin.js");
const log = new (require("cat-loggr"))();

// ====================== Theme Routes ======================

// GET - Render Theme Customization Page
router.get("/admin/settings/theme", hasPermission('manage_settings'), async (req, res) => {
  try {
    const settings = (await db.get("settings")) || {};
    let theme = (await db.get("theme")) || {};

    // Default values (so your live preview works even on first load)
    if (!theme || Object.keys(theme).length === 0) {
      theme = {
        primary: "#3b82f6",
        primaryHover: "#2563eb",
        accent: "#8b5cf6",
        background: "#0f172a",
        cardBg: "#1e2937",
        textPrimary: "#f1f5f9",
        textSecondary: "#94a3b8",
        border: "#334155",
        success: "#22c55e",
        warning: "#eab308",
        error: "#ef4444",
        radius: "12px"
      };
    }

    res.render("admin/settings/theme", {
      req,
      user: req.user,
      settings,
      theme
    });
  } catch (error) {
    log.error("Error loading theme settings:", error);
    res.status(500).send("Failed to load theme settings page.");
  }
});

// POST - Save Theme to Database
router.post("/admin/settings/theme/save", hasPermission('manage_settings'), async (req, res) => {
  try {
    const themeData = req.body;

    await db.set("theme", themeData);

    logAudit(req.user.userId, req.user.username, "theme:edit", req.ip);

    res.redirect("/admin/settings/theme?msg=ThemeSaveSuccess");
  } catch (error) {
    log.error("Error saving theme:", error);
    res.redirect("/admin/settings/theme?err=ThemeSaveFailed");
  }
});

// (Optional but recommended) Reset to Default
router.post("/admin/settings/theme/reset", hasPermission('manage_settings'), async (req, res) => {
  try {
    const defaultTheme = {
      primary: "#3b82f6",
      primaryHover: "#2563eb",
      accent: "#8b5cf6",
      background: "#0f172a",
      cardBg: "#1e2937",
      textPrimary: "#f1f5f9",
      textSecondary: "#94a3b8",
      border: "#334155",
      success: "#22c55e",
      warning: "#eab308",
      error: "#ef4444",
      radius: "12px"
    };

    await db.set("theme", defaultTheme);
    logAudit(req.user.userId, req.user.username, "theme:reset", req.ip);

    res.redirect("/admin/settings/theme?msg=ThemeResetToDefault");
  } catch (error) {
    log.error("Error resetting theme:", error);
    res.redirect("/admin/settings/theme?err=ResetFailed");
  }
});

module.exports = router;
