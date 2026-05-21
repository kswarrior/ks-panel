const express = require("express");
const router = express.Router();
const { db } = require("../../handlers/db.js");
const { anyAdminPerm, hasPermission } = require("../../utils/isAdmin.js");

// Admin View: Notification Management
router.get("/admin/notifications", hasPermission('manage_users'), async (req, res) => {
  const users = await db.get("users") || [];
  res.render("admin/notifications", {
    req,
    user: req.user,
    users
  });
});

// GET all notifications for the user
router.get("/api/notifications", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const notifications = await db.get(`notifications_${req.user.userId}`) || [];
  res.json(notifications);
});

// POST a notification (Internal API for panel events)
router.post("/api/notifications/add", anyAdminPerm, async (req, res) => {
  const { userId, type, message, broadcast } = req.body;
  if ((!userId && !broadcast) || !type || !message) return res.status(400).json({ error: "Missing data" });

  const addNotif = async (targetId) => {
    const notifications = await db.get(`notifications_${targetId}`) || [];
    notifications.unshift({
      id: Date.now() + Math.random(),
      type, // 'warning', 'error', 'important'
      message,
      timestamp: new Date().toISOString(),
      read: false
    });
    if (notifications.length > 50) notifications.pop();
    await db.set(`notifications_${targetId}`, notifications);
  };

  if (broadcast === "true" || broadcast === true) {
    const users = await db.get("users") || [];
    for (const u of users) {
      await addNotif(u.userId);
    }
  } else {
    await addNotif(userId);
  }

  res.json({ success: true });
});

// DELETE/Clear notifications
router.delete("/api/notifications/clear", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  await db.set(`notifications_${req.user.userId}`, []);
  res.json({ success: true });
});

module.exports = router;
