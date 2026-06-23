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

/**
 * Validates that the current user has all permissions they are trying to grant to a role.
 * Owners/Admins bypass this check.
 */
function validatePermissionsGrant(req, permissionsToGrant) {
  if (req.user.owner || req.user.admin) return true;

  const userPermissions = req.user.permissions || {};
  const requestedIds = Object.keys(permissionsToGrant).filter(k => permissionsToGrant[k] === true || permissionsToGrant[k] === 'true');

  for (const id of requestedIds) {
    if (!userPermissions[id] && !userPermissions.all) return false;
  }
  return true;
}

router.get("/admin/roles", hasPermission("manage_users"), async (req, res) => {
  const roles = await db.get("roles") || [];

  // Include virtual roles for display
  const allRoles = [
    { id: 'owner', name: 'Owner', color: '#f59e0b', permissions: { all: true }, virtual: true },
    { id: 'admin', name: 'Administrator', color: '#3b82f6', permissions: { all: true }, virtual: true },
    { id: 'user', name: 'User', color: '#94a3b8', permissions: {}, virtual: true },
    ...roles
  ];

  res.render("admin/roles/overview", {
    req,
    user: req.user,
    roles: allRoles
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

  if (!validatePermissionsGrant(req, permissions)) {
    return res.status(403).send("You cannot grant permissions that you do not possess.");
  }

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
  const { id } = req.params;

  // Handle virtual roles
  if (id === 'owner' || id === 'admin' || id === 'user') {
    const virtualRoles = {
      owner: { id: 'owner', name: 'Owner', color: '#f59e0b', permissions: { all: true }, virtual: true },
      admin: { id: 'admin', name: 'Administrator', color: '#3b82f6', permissions: { all: true }, virtual: true },
      user: { id: 'user', name: 'User', color: '#94a3b8', permissions: {}, virtual: true }
    };
    return res.render("admin/roles/edit", {
      req,
      user: req.user,
      role: virtualRoles[id],
      systemPermissions: SYSTEM_PERMISSIONS
    });
  }

  const roles = await db.get("roles") || [];
  const role = roles.find(r => r.id === id);
  if (!role) return res.status(404).send("Role not found");

  res.render("admin/roles/edit", {
    req,
    user: req.user,
    role,
    systemPermissions: SYSTEM_PERMISSIONS
  });
});

router.post("/admin/roles/edit/:id", hasPermission("manage_users"), async (req, res) => {
  const { id } = req.params;
  const { name, color, permissions = {} } = req.body;

  if (id === 'owner' || id === 'admin' || id === 'user') {
     return res.status(403).send("Virtual roles cannot be modified via this route.");
  }

  if (!validatePermissionsGrant(req, permissions)) {
    return res.status(403).send("You cannot grant permissions that you do not possess.");
  }

  let roles = await db.get("roles") || [];
  const index = roles.findIndex(r => r.id === id);
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
  if (roleId === 'owner' || roleId === 'admin' || roleId === 'user') {
      return res.status(403).send("Cannot delete virtual roles.");
  }

  let roles = await db.get("roles") || [];
  roles = roles.filter(r => r.id !== roleId);
  await db.set("roles", roles);

  logAudit(req.user.userId, req.user.username, "role:delete", req.ip);
  res.status(204).send();
});

module.exports = router;
