// panel/routes/Admin/Dashboard.js
// Clean & minimal - ONLY resources monitor + live PM2 logs
// Matches exactly the style of other Admin route files

const express = require("express");
const router = express.Router();
const config = require("../../config.json");
const { isAdmin } = require("../../utils/isAdmin.js");

// =====================
// TRUE LIVE PM2 LOG STREAM (exact same as before - real SSE)
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
// DASHBOARD OVERVIEW ROUTE - ONLY RENDER (no analytics, no DB calls)
// =====================
router.get("/admin/dashboard/overview", isAdmin, (req, res) => {
  res.render("admin/dashboard/overview", {
    req,
    user: req.user,
    version: config.version
  });
});

module.exports = router;
