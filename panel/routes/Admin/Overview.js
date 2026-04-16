const express = require("express");
const router = express.Router();
const { db } = require("../../handlers/db.js");
const config = require("../../config.json");
const { isAdmin, anyAdminPerm } = require("../../utils/isAdmin.js");

// Required for live PM2 logs
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

router.get("/admin/overview", anyAdminPerm, async (req, res) => {
  try {
    const [users, nodesIds, images, instances, analyticsRaw] = await Promise.all([
      db.get("users").then(data => data || []),
      db.get("nodes").then(data => data || []),
      db.get("images").then(data => data || []),
      db.get("instances").then(data => data || []),
      db.get("analytics").then(data => data || [])
    ]);

    const usersTotal = users.length;
    const nodesTotal = nodesIds.length;
    const imagesTotal = images.length;
    const instancesTotal = instances.length;

    const pageViews = analyticsRaw.reduce((acc, item) => {
      acc[item.path] = (acc[item.path] || 0) + 1;
      return acc;
    }, {});

    const methodCounts = analyticsRaw.reduce((acc, item) => {
      acc[item.method] = (acc[item.method] || 0) + 1;
      return acc;
    }, {});

    const totalRequests = analyticsRaw.length;
    const uniqueVisitors = new Set(analyticsRaw.map(item => item.ip)).size;
    const avgRequestsPerHour = totalRequests > 0 ? (totalRequests / 24).toFixed(1) : 0;

    const pageCounts = { ...pageViews };
    const topPage = Object.keys(pageCounts).length > 0 
      ? Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0][0] 
      : 'N/A';

    const trafficOverTime = Array(24).fill(0);
    analyticsRaw.forEach(item => {
      const hour = new Date(item.timestamp).getHours();
      trafficOverTime[hour]++;
    });

    const topPagesList = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    res.render("admin/overview", {
      req,
      user: req.user,
      usersTotal,
      nodesTotal,
      imagesTotal,
      instancesTotal,
      version: config.version,

      totalRequests,
      uniqueVisitors,
      avgRequestsPerHour,
      topPage,
      pageViews,
      methodCounts,
      trafficOverTimeData: {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        data: trafficOverTime
      },
      topPagesData: {
        labels: topPagesList.map(([page]) => page),
        data: topPagesList.map(([, count]) => count)
      }
    });
  } catch (error) {
    console.error('Overview error:', error);
    res.status(500).send("Failed to retrieve dashboard data.");
  }
});

router.get("/api/analytics", anyAdminPerm, async (req, res) => {
  try {
    const analytics = (await db.get("analytics")) || [];
    const totalRequests = analytics.length;
    const uniqueVisitors = new Set(analytics.map(item => item.ip)).size;
    const avgRequestsPerHour = totalRequests / 24;

    const pageCounts = analytics.reduce((acc, item) => {
      acc[item.path] = (acc[item.path] || 0) + 1;
      return acc;
    }, {});

    const topPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const trafficOverTime = Array(24).fill(0);
    analytics.forEach(item => {
      const hour = new Date(item.timestamp).getHours();
      trafficOverTime[hour]++;
    });

    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    res.json({
      totalRequests,
      uniqueVisitors,
      avgRequestsPerHour: avgRequestsPerHour.toFixed(1),
      topPage,
      trafficOverTime: {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        data: trafficOverTime,
      },
      topPages: {
        labels: topPages.map(([page]) => page),
        data: topPages.map(([, count]) => count),
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// =====================
// TRUE LIVE PM2 LOG STREAM USING `npx pm2 logs kspanel`
// =====================
router.get("/admin/api/server-logs/stream", anyAdminPerm, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const pm2Process = spawn("npx", ["pm2", "logs", "kspanel", "--raw"], {
    shell: true
  });

  pm2Process.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach(line => {
      if (line.trim() !== "") {
        res.write(`data: ${line}\n\n`);
      }
    });
  });

  pm2Process.stderr.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach(line => {
      if (line.trim() !== "") {
        res.write(`data: [ERROR] ${line}\n\n`);
      }
    });
  });

  req.on("close", () => {
    pm2Process.kill();
    res.end();
  });
});

module.exports = router;
