const express = require("express");
const router = express.Router();
const { db } = require("../../handlers/db.js");
const config = require("../../config.json");
const { isAdmin } = require("../../utils/isAdmin.js");

// =====================
// DATABASE OVERVIEW ROUTE
// =====================
router.get("/admin/database/overview", isAdmin, async (req, res) => {
  try {
    const [users, nodes, images, instances, analyticsRaw, apiKeysRaw, pluginsRaw] = await Promise.all([
      db.get("users").then(d => d || []),
      db.get("nodes").then(d => d || []),
      db.get("images").then(d => d || []),
      db.get("instances").then(d => d || []),
      db.get("analytics").then(d => d || []),
      db.get("apiKeys").then(d => d || []),
      db.get("plugins").then(d => d || [])
    ]);

    const usersTotal = users.length;
    const adminsTotal = users.filter(u => u.admin === true || u.role === "admin").length;
    const instancesTotal = instances.length;
    const suspendedTotal = instances.filter(i => i.suspended === true).length;
    const templatesTotal = images.length;

    const nodesTotal = nodes.length;
    const onlineNodes = nodes.filter(n => n.status === "online" || n.online === true).length;
    const offlineNodes = nodesTotal - onlineNodes;
    const locationsTotal = new Set(nodes.map(n => n.location || "Unknown")).size;

    const apiKeysTotal = apiKeysRaw.length;
    const pluginsTotal = pluginsRaw.length;

    const totalRequests = analyticsRaw.length;
    const uniqueVisitors = new Set(analyticsRaw.map(item => item.ip)).size;
    const avgRequestsPerHour = totalRequests > 0 ? (totalRequests / 24).toFixed(1) : 0;

    res.render("admin/database/overview", {
      req,
      user: req.user,
      version: config.version,

      usersTotal,
      adminsTotal,
      instancesTotal,
      suspendedTotal,
      templatesTotal,
      onlineNodes,
      offlineNodes,
      nodesTotal,
      locationsTotal,
      apiKeysTotal,
      pluginsTotal,
      totalRequests,
      uniqueVisitors,
      avgRequestsPerHour
    });
  } catch (error) {
    console.error('Database Overview error:', error);
    res.status(500).send("Failed to retrieve database statistics.");
  }
});

// =====================
// JSON API FOR LIVE REFRESH
// =====================
router.get("/admin/api/database/stats", isAdmin, async (req, res) => {
  try {
    const [users, nodes, images, instances, analyticsRaw, apiKeysRaw, pluginsRaw] = await Promise.all([
      db.get("users").then(d => d || []),
      db.get("nodes").then(d => d || []),
      db.get("images").then(d => d || []),
      db.get("instances").then(d => d || []),
      db.get("analytics").then(d => d || []),
      db.get("apiKeys").then(d => d || []),
      db.get("plugins").then(d => d || [])
    ]);

    const usersTotal = users.length;
    const adminsTotal = users.filter(u => u.admin === true || u.role === "admin").length;
    const instancesTotal = instances.length;
    const suspendedTotal = instances.filter(i => i.suspended === true).length;
    const templatesTotal = images.length;

    const nodesTotal = nodes.length;
    const onlineNodes = nodes.filter(n => n.status === "online" || n.online === true).length;
    const offlineNodes = nodesTotal - onlineNodes;
    const locationsTotal = new Set(nodes.map(n => n.location || "Unknown")).size;

    const apiKeysTotal = apiKeysRaw.length;
    const pluginsTotal = pluginsRaw.length;

    const totalRequests = analyticsRaw.length;
    const uniqueVisitors = new Set(analyticsRaw.map(item => item.ip)).size;
    const avgRequestsPerHour = totalRequests > 0 ? (totalRequests / 24).toFixed(1) : 0;

    res.json({
      usersTotal,
      adminsTotal,
      instancesTotal,
      suspendedTotal,
      templatesTotal,
      onlineNodes,
      offlineNodes,
      nodesTotal,
      locationsTotal,
      apiKeysTotal,
      pluginsTotal,
      totalRequests,
      uniqueVisitors,
      avgRequestsPerHour
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch database stats" });
  }
});

module.exports = router;
