const express = require("express");
const router = express.Router();
const { db } = require("../../../handlers/db.js");
const fs = require("node:fs");
const path = require("path");
const { anyAdminPerm, checkPermission } = require("../../../utils/isAdmin.js");

router.get("/api/me", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const users = await db.get("users") || [];
  const roles = await db.get("roles") || [];
  const dbUser = users.find(u => u.userId === req.user.userId);

  const permissions = {
    anyAdmin: false,
    manage_users: checkPermission(dbUser, roles, 'manage_users'),
    manage_nodes: checkPermission(dbUser, roles, 'manage_nodes'),
    create_instances: checkPermission(dbUser, roles, 'create_instances'),
    manage_templates: checkPermission(dbUser, roles, 'manage_templates'),
    view_audit_logs: checkPermission(dbUser, roles, 'view_audit_logs'),
    manage_settings: checkPermission(dbUser, roles, 'manage_settings'),
    manage_plugins: checkPermission(dbUser, roles, 'manage_plugins'),
    manage_api_keys: checkPermission(dbUser, roles, 'manage_api_keys'),
    manage_roles: checkPermission(dbUser, roles, 'manage_roles'),
  };

  // Re-calculate anyAdmin
  const adminPerms = ['create_instances', 'manage_nodes', 'manage_users', 'manage_templates', 'view_audit_logs', 'manage_settings'];
  permissions.anyAdmin = (dbUser && (dbUser.owner || dbUser.admin)) || adminPerms.some(p => checkPermission(dbUser, roles, p));

  res.json({
    user: {
      userId: req.user.userId,
      username: req.user.username,
      email: req.user.email,
      admin: req.user.admin,
      owner: req.user.owner,
    },
    permissions
  });
});

router.get("/api/settings", async (req, res) => {
  const settings = await db.get("settings") || {};
  const theme = await db.get("theme") || {};
  res.json({
    name: settings.name || "KS Panel",
    logo: settings.logo || "/assets/logo.webp",
    footer: settings.footer || "",
    theme
  });
});

router.get("/api/translations", async (req, res) => {
  const lang = req.cookies.lang || "en";
  const translationsPath = path.join(__dirname, "../../../lang", `${lang}.json`);
  try {
    const translations = JSON.parse(fs.readFileSync(translationsPath, "utf8"));
    res.json(translations);
  } catch (e) {
    res.status(500).json({ error: "Failed to load translations" });
  }
});

module.exports = router;
