const express = require("express");
const router = express.Router();
const { db } = require("../../handlers/db.js");
const { anyAdminPerm } = require("../../utils/isAdmin.js");

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
