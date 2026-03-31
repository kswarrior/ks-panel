const express = require("express");
const router = express.Router();
const { db } = require("../../handlers/db.js");
const config = require("../../config.json");
const { isAdmin } = require("../../utils/isAdmin.js");
const { Client } = require("pg");

// =====================
// FULL DASHBOARD STATS (Everything combined - Users, Nodes, Instances, DB, Analytics, etc.)
// =====================
async function getDashboardStats() {
  // Fetch all raw data in parallel
  const [usersRaw, nodeIdsRaw, images, instancesRaw, analyticsRaw, apiKeysRaw, pluginsRaw] = await Promise.all([
    db.get("users").then(d => d || []),
    db.get("nodes").then(d => d || []),
    db.get("images").then(d => d || []),
    db.get("instances").then(d => d || []),
    db.get("analytics").then(d => d || []),
    db.get("apiKeys").then(d => d || []),
    db.get("plugins").then(d => d || [])
  ]);

  // Load full node objects
  const nodes = await Promise.all(
    nodeIdsRaw.map(id => db.get(`${id}_node`).then(d => d || { status: "Offline", location: "Unknown" }))
  );

  // =====================
  // USER & INSTANCE STATS
  // =====================
  const usersTotal = usersRaw.length;
  const adminsTotal = usersRaw.filter(u => u.admin === true).length;
  const instancesTotal = instancesRaw.length;
  const suspendedTotal = instancesRaw.filter(i => i.suspended === true).length;
  const runningInstances = instancesRaw.filter(i => i.status === "Running").length;
  const stoppedInstances = instancesTotal - runningInstances - suspendedTotal;

  // =====================
  // NODE STATS
  // =====================
  const nodesTotal = nodes.length;
  const onlineNodes = nodes.filter(n => (n.status || '').toLowerCase() === 'online').length;
  const offlineNodes = nodesTotal - onlineNodes;
  const locationsTotal = new Set(nodes.map(n => n.location || "Unknown")).size;

  // =====================
  // OTHER STATS
  // =====================
  const templatesTotal = images.length;
  const apiKeysTotal = apiKeysRaw.length;
  const pluginsTotal = pluginsRaw.length;

  // =====================
  // ANALYTICS
  // =====================
  const totalRequests = analyticsRaw.length;
  const uniqueVisitors = new Set(analyticsRaw.map(item => item.ip)).size;
  const avgRequestsPerHour = totalRequests > 0 ? (totalRequests / 24).toFixed(1) : 0;

  // =====================
  // REAL POSTGRESQL DATABASE INFO
  // =====================
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
    // Main Stats
    usersTotal,
    adminsTotal,
    instancesTotal,
    runningInstances,
    stoppedInstances,
    suspendedTotal,
    templatesTotal,

    // Nodes
    nodesTotal,
    onlineNodes,
    offlineNodes,
    locationsTotal,

    // Others
    apiKeysTotal,
    pluginsTotal,

    // Analytics
    totalRequests,
    uniqueVisitors,
    avgRequestsPerHour,

    // Full Database Info
    dbType,
    dbSize,
    dbUrlMasked,
    dbTable,
    totalKeys,

    // Extra useful flags
    databaseConfigured: !!config.databaseURL,
    lastUpdated: new Date().toISOString()
  };
}

// =====================
// LIVE PM2 LOG STREAM (Server Logs - Real-time SSE)
// =====================
const { spawn } = require("child_process");

router.get("/admin/dashboard/api/server-logs/stream", isAdmin, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const pm2Process = spawn("npx", ["pm2", "logs", "kspanel", "--raw"], { shell: true });

  pm2Process.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach((line) => {
      if (line.trim()) res.write(`data: ${line}\n\n`);
    });
  });

  pm2Process.stderr.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach((line) => {
      if (line.trim()) res.write(`data: [ERROR] ${line}\n\n`);
    });
  });

  req.on("close", () => {
    pm2Process.kill();
    res.end();
  });
});

// =====================
// MAIN DASHBOARD PAGE
// =====================
router.get("/admin/dashboard/overview", isAdmin, async (req, res) => {
  try {
    const stats = await getDashboardStats();

    res.render("admin/dashboard/overview", {
      req,
      user: req.user,
      version: config.version,
      ...stats
    });
  } catch (error) {
    console.error('Dashboard Overview error:', error);
    res.status(500).send("Failed to retrieve dashboard statistics.");
  }
});

// =====================
// LIVE STATS API (for frontend auto-refresh)
// =====================
router.get("/admin/dashboard/api/stats", isAdmin, async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

module.exports = router;
