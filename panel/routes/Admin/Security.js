const express = require("express");
const router = express.Router();
const { db } = require("../../handlers/db.js");
const { anyAdminPerm, hasPermission } = require("../../utils/isAdmin.js");
const { spawn, exec } = require("child_process");
const pidusage = require("pidusage");
const { createTerminal } = require("../../lib/terminal.js");
const os = require("os");
const fs = require("fs");
const path = require("path");

// =====================
// LIVE SYSTEM METRICS (Whole VPS)
// =====================
router.get("/admin/insights/api/system-metrics", anyAdminPerm, async (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // Simple load avg for CPU
    const load = os.loadavg();
    const cpuUsage = (load[0] / os.cpus().length) * 100;

    // Disk usage (root)
    exec("df -h / | tail -1 | awk '{print $3 \",\" $2 \",\" $5}'", (err, stdout) => {
      let diskInfo = { used: "0", total: "0", percent: "0" };
      if (!err && stdout) {
        const parts = stdout.trim().split(",");
        diskInfo = { used: parts[0], total: parts[1], percent: parts[2] };
      }

      res.json({
        cpu: { percent: cpuUsage.toFixed(1), cores: os.cpus().length },
        ram: {
          used: (usedMem / 1024 / 1024 / 1024).toFixed(2),
          total: (totalMem / 1024 / 1024 / 1024).toFixed(2),
          percent: ((usedMem / totalMem) * 100).toFixed(1)
        },
        disk: diskInfo,
        uptime: os.uptime(),
        hostname: os.hostname(),
        platform: os.platform()
      });
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

// =====================
// PANEL PROCESS METRICS
// =====================
router.get("/admin/insights/api/panel-metrics", anyAdminPerm, async (req, res) => {
  try {
    const stats = await pidusage(process.pid);
    res.json({
      cpu: stats.cpu.toFixed(1),
      ram: (stats.memory / 1024 / 1024).toFixed(1), // MB
      elapsed: (stats.elapsed / 1000).toFixed(0), // seconds
      priority: os.getPriority(process.pid)
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch panel metrics" });
  }
});

// =====================
// RESOURCE CONTROL
// =====================
router.post("/admin/insights/api/panel-control", anyAdminPerm, (req, res) => {
  const { priority } = req.body;
  if (priority !== undefined) {
    try {
      os.setPriority(process.pid, parseInt(priority));
      return res.json({ success: true, priority: os.getPriority(process.pid) });
    } catch (e) {
      return res.status(500).json({ error: "Failed to set priority" });
    }
  }
  res.status(400).json({ error: "Invalid request" });
});

// =====================
// FULL TERMINAL (WebSocket)
// =====================
router.ws("/admin/security/ws/terminal", async (ws, req) => {
  // Middleware for express-ws is tricky, so we check session manually
  if (!req.session || !req.session.passport || !req.session.passport.user) {
    ws.close(1008, "Unauthorized");
    return;
  }

  try {
    const username = req.session.passport.user;
    const users = await db.get("users") || [];
    const dbUser = users.find(u => u.username === username);

    // Strict check: Only owners can access the host terminal
    if (!dbUser || !dbUser.owner) {
      ws.send("\r\n\x1b[31m[Security] Access Denied: Only owners can access the system terminal.\x1b[0m\r\n");
      ws.close(1008, "Forbidden");
      return;
    }

    createTerminal(ws);
  } catch (err) {
    ws.close(1011, "Internal Server Error");
  }
});

// =====================
// PORT PREVIEW
// =====================
router.get("/admin/security/api/ports", anyAdminPerm, (req, res) => {
  exec("ss -tunlp | awk 'NR>1 {print $1 \",\" $5 \",\" $7}'", (err, stdout) => {
    if (err) return res.status(500).json({ error: "Failed to list ports" });
    const lines = stdout.trim().split("\n").map(l => {
      const parts = l.split(",");
      return { proto: parts[0], addr: parts[1], process: parts[2] };
    });
    res.json(lines);
  });
});

// =====================
// SECURITY CENTER PAGE
// =====================
router.get("/admin/security/overview", anyAdminPerm, async (req, res) => {
  const security = await db.get("security_settings") || {
    rateLimitWindow: 5,
    rateLimitMax: 5000,
    networkLimit: 100
  };
  res.render("admin/security/overview", {
    req,
    user: req.user,
    title: "Security Center",
    security
  });
});

// =====================
// UPDATE SECURITY SETTINGS
// =====================
router.post("/admin/security/api/settings", anyAdminPerm, async (req, res) => {
  const { rateLimitWindow, rateLimitMax, networkLimit } = req.body;
  await db.set("security_settings", {
    rateLimitWindow: parseInt(rateLimitWindow),
    rateLimitMax: parseInt(rateLimitMax),
    networkLimit: parseInt(networkLimit)
  });
  res.json({ success: true });
});

module.exports = router;
