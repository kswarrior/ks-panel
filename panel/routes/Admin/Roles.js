const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { db } = require("../../handlers/db.js");
const { logAudit } = require("../../handlers/auditLog.js");
const { isAdmin, hasPermission } = require("../../utils/isAdmin.js");

// Defined system permissions (Shared with Users)
const SYSTEM_PERMISSIONS = [
  { id: 'create_instances', name: 'Create Instances', description: 'Allow user to create new instances' },
  { id: 'manage_nodes', name: 'Manage Nodes', description: 'Full access to node settings and creation' },
  { id: 'manage_users', name: 'Manage Users', description: 'Create, edit, and delete other users' },
  { id: 'manage_templates', name: 'Manage Templates', description: 'Edit and create server templates' },
  { id: 'view_audit_logs', name: 'View Audit Logs', description: 'Access to system-wide audit records' },
  { id: 'manage_settings', name: 'System Settings', description: 'Change panel appearance and SMTP settings' }
];

router.get("/admin/roles", hasPermission("manage_users"), async (req, res) => {
  const roles = await db.get("roles") || [];
  res.render("admin/roles/overview", {
    req,
    user: req.user,
    roles
  });
});

router.get("/admin/roles/create", hasPermission("manage_users"), (req, res) => {
  res.render("admin/roles/create", {
    req,
    user: req.user,
    systemPermissions: SYSTEM_PERMISSIONS
  });
});

router.post("/admin/roles/create", hasPermission("manage_users"), async (req, res) => {
  const { name, color, permissions = {} } = req.body;
  if (!name) return res.status(400).send("Role name is required.");

  const roleId = uuidv4();
  const newRole = {
    id: roleId,
    name,
    color: color || "#3b82f6",
    permissions
  };

  let roles = await db.get("roles") || [];
  roles.push(newRole);
  await db.set("roles", roles);

  logAudit(req.user.userId, req.user.username, "role:create", req.ip);
  res.redirect("/admin/roles");
});

router.get("/admin/roles/edit/:id", hasPermission("manage_users"), async (req, res) => {
  const roles = await db.get("roles") || [];
  const role = roles.find(r => r.id === req.params.id);
  if (!role) return res.status(404).send("Role not found");

  res.render("admin/roles/edit", {
    req,
    user: req.user,
    role,
    systemPermissions: SYSTEM_PERMISSIONS
  });
});

router.post("/admin/roles/edit/:id", hasPermission("manage_users"), async (req, res) => {
  const { name, color, permissions = {} } = req.body;
  let roles = await db.get("roles") || [];
  const index = roles.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).send("Role not found");

  roles[index].name = name;
  roles[index].color = color;
  roles[index].permissions = permissions;

  await db.set("roles", roles);
  logAudit(req.user.userId, req.user.username, "role:edit", req.ip);
  res.redirect("/admin/roles");
});

router.post("/admin/roles/delete", hasPermission("manage_users"), async (req, res) => {
  const { roleId } = req.body;
  let roles = await db.get("roles") || [];
  roles = roles.filter(r => r.id !== roleId);
  await db.set("roles", roles);

  logAudit(req.user.userId, req.user.username, "role:delete", req.ip);
  res.status(204).send();
});

module.exports = router;
