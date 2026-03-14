const express = require("express");
const router = express.Router();
const { db } = require("../../handlers/db.js");
const config = require("../../config.json");
const { isAdmin } = require("../../utils/isAdmin.js");
const { Client } = require("pg");   // already installed

// =====================
// SHARED STATS FUNCTION (no more duplication)
// =====================
async function getDatabaseStats() {
  const [usersRaw, nodeIdsRaw, images, instancesRaw, analyticsRaw, apiKeysRaw, pluginsRaw] = await Promise.all([
    db.get("users").then(d => d || []),
    db.get("nodes").then(d => d || []),
    db.get("images").then(d => d || []),
    db.get("instances").then(d => d || []),
    db.get("analytics").then(d => d || []),
    db.get("apiKeys").then(d => d || []),
    db.get("plugins").then(d => d || [])
  ]);

  // === FIXED NODES (full objects) ===
  const nodes = await Promise.all(
    nodeIdsRaw.map(id => db.get(`${id}_node`).then(d => d || { status: "Offline", location: "Unknown" }))
  );

  const usersTotal = usersRaw.length;
  const adminsTotal = usersRaw.filter(u => u.admin === true).length; // no 'role' field exists
  const instancesTotal = instancesRaw.length;
  const suspendedTotal = instancesRaw.filter(i => i.suspended === true).length;
  const templatesTotal = images.length;

  const nodesTotal = nodes.length;
  const onlineNodes = nodes.filter(n => (n.status || '').toLowerCase() === 'online').length;
  const offlineNodes = nodesTotal - onlineNodes;
  const locationsTotal = new Set(nodes.map(n => n.location || "Unknown")).size;

  const apiKeysTotal = apiKeysRaw.length;
  const pluginsTotal = pluginsRaw.length;

  const totalRequests = analyticsRaw.length;
  const uniqueVisitors = new Set(analyticsRaw.map(item => item.ip)).size;
  const avgRequestsPerHour = totalRequests > 0 ? (totalRequests / 24).toFixed(1) : 0;

  // === NEW: REAL DATABASE INFO ===
  let dbType = "PostgreSQL";
  let dbUrlMasked = "Not configured";
  let dbSize = "Unknown";
  let dbTable = config.databaseTable || "kspanel";
  let totalKeys = 0;

  if (config.databaseURL) {
    dbUrlMasked = config.databaseURL.replace(/:\/\/[^:]+:[^@]+@/, '://****:****@');
    try {
      const client = new Client({ connectionString: config.databaseURL });
      await client.connect();

      const sizeRes = await client.query(`SELECT pg_size_pretty(pg_database_size(current_database())) as size`);
      dbSize = sizeRes.rows[0].size;

      const keysRes = await client.query(`SELECT COUNT(*) as count FROM ${dbTable}`);
      totalKeys = parseInt(keysRes.rows[0].count) || 0;

      await client.end();
    } catch (err) {
      console.error('DB info query failed:', err);
      dbSize = "Query Error";
      totalKeys = "Error";
    }
  }

  return {
    usersTotal, adminsTotal, instancesTotal, suspendedTotal, templatesTotal,
    nodesTotal, onlineNodes, offlineNodes, locationsTotal,
    apiKeysTotal, pluginsTotal,
    totalRequests, uniqueVisitors, avgRequestsPerHour,
    // NEW
    dbType, dbSize, dbUrlMasked, dbTable, totalKeys
  };
}

// =====================
// PAGE ROUTE
// =====================
router.get("/admin/database/overview", isAdmin, async (req, res) => {
  try {
    const stats = await getDatabaseStats();
    res.render("admin/database/overview", {
      req, user: req.user, version: config.version, ...stats
    });
  } catch (error) {
    console.error('Database Overview error:', error);
    res.status(500).send("Failed to retrieve database statistics.");
  }
});

// =====================
// JSON API (LIVE REFRESH)
// =====================
router.get("/admin/api/database/stats", isAdmin, async (req, res) => {
  try {
    const stats = await getDatabaseStats();
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch database stats" });
  }
});

module.exports = router;
