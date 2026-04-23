const express = require("express");
const router = express.Router();
const { db } = require("../handlers/db.js");
const { v4: uuidv4 } = require("uuid");
const { anyAdminPerm } = require("../utils/isAdmin.js");

// =====================
// USER ROUTES (Support Center)
// =====================

router.get("/tickets", async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const ticketIds = await db.get("tickets") || [];
  const allTickets = await Promise.all(ticketIds.map(id => db.get(`${id}_ticket`)));
  const userTickets = allTickets.filter(t => t && t.userId === req.user.userId);

  res.render("dashboard/tickets", {
    req,
    user: req.user,
    tickets: userTickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  });
});

router.post("/tickets/create", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { subject, priority, message } = req.body;
  if (!subject || !message) return res.status(400).json({ error: "Missing data" });

  const ticketId = uuidv4();
  const ticket = {
    id: ticketId,
    userId: req.user.userId,
    username: req.user.username,
    subject,
    priority: priority || "medium",
    status: "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [{
      senderId: req.user.userId,
      senderName: req.user.username,
      isAdmin: false,
      text: message,
      timestamp: new Date().toISOString()
    }]
  };

  await db.set(`${ticketId}_ticket`, ticket);
  const ticketIds = await db.get("tickets") || [];
  ticketIds.push(ticketId);
  await db.set("tickets", ticketIds);

  res.json({ success: true, ticketId });
});

router.post("/tickets/reply/:id", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { message } = req.body;
  const ticketId = req.params.id;

  const ticket = await db.get(`${ticketId}_ticket`);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const [users, roles] = await Promise.all([
    db.get("users") || [],
    db.get("roles") || []
  ]);
  const dbUser = users.find(u => u.userId === req.user.userId);
  const isAdmin = dbUser && (dbUser.owner || dbUser.admin);

  if (ticket.userId !== req.user.userId && !isAdmin) {
    return res.status(403).json({ error: "Access denied" });
  }

  ticket.messages.push({
    senderId: req.user.userId,
    senderName: req.user.username,
    isAdmin: !!isAdmin,
    text: message,
    timestamp: new Date().toISOString()
  });
  ticket.updatedAt = new Date().toISOString();
  if (!isAdmin) ticket.status = "open";

  await db.set(`${ticketId}_ticket`, ticket);
  res.json({ success: true });
});

// =====================
// ADMIN ROUTES (Ticket Management)
// =====================

router.get("/admin/tickets", anyAdminPerm, async (req, res) => {
  const ticketIds = await db.get("tickets") || [];
  const allTickets = await Promise.all(ticketIds.map(id => db.get(`${id}_ticket`)));

  res.render("admin/tickets", {
    req,
    user: req.user,
    tickets: allTickets.filter(Boolean).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  });
});

router.post("/admin/tickets/status/:id", anyAdminPerm, async (req, res) => {
  const { status } = req.body;
  const ticketId = req.params.id;

  const ticket = await db.get(`${ticketId}_ticket`);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
  await db.set(`${ticketId}_ticket`, ticket);
  res.json({ success: true });
});

module.exports = router;
