const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { db } = require("../../handlers/db.js");
const { logAudit } = require("../../handlers/auditLog.js");
const { isAdmin, hasPermission } = require("../../utils/isAdmin.js");
const { getPaginatedUsers, invalidateCache } = require("../../utils/dbHelper.js");
const cache = require("../../utils/cache.js");

const saltRounds = 10;

// Defined system permissions (Internal)
const SYSTEM_PERMISSIONS = [
  { id: 'create_instances', name: 'Create Instances', description: 'Allow user to create new instances' },
  { id: 'manage_nodes', name: 'Manage Nodes', description: 'Full access to node settings and creation' },
  { id: 'manage_users', name: 'Manage Users', description: 'Create, edit, and delete other users' },
  { id: 'manage_templates', name: 'Manage Templates', description: 'Edit and create server templates' },
  { id: 'view_audit_logs', name: 'View Audit Logs', description: 'Access to system-wide audit records' },
  { id: 'manage_settings', name: 'System Settings', description: 'Change panel appearance and SMTP settings' }
];

async function doesUserExist(username) {
  const users = await db.get("users");
  return users ? users.some((user) => user.username === username) : false;
}

async function doesEmailExist(email) {
  const users = await db.get("users");
  return users ? users.some((user) => user.email === email) : false;
}

router.get("/admin/users", hasPermission("manage_users"), async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 20;
  const usersResult = await getPaginatedUsers(page, pageSize);
  const roles = await db.get("roles") || [];

  res.render("admin/users/overview", {
    req,
    user: req.user,
    users: usersResult.data,
    pagination: usersResult.pagination,
    roles
  });
});

router.get("/admin/users/create", hasPermission("manage_users"), async (req, res) => {
  const roles = await db.get("roles") || [];
  res.render("admin/users/create", {
    req,
    user: req.user,
    roles
  });
});

router.post("/users/create", hasPermission("manage_users"), async (req, res) => {
  const { username, email, password, roleId, verified } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send("Username, email, and password are required.");
  }

  if (await doesUserExist(username)) return res.status(400).send("User already exists.");
  if (await doesEmailExist(email)) return res.status(400).send("Email already exists.");

  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const users = (await db.get("users")) || [];
  const isOwner = users.length === 0;

  // Role Logic: Admin roleId is reserved, User is default
  let userAdmin = false;
  if (roleId === 'admin') userAdmin = true;

  const newUser = {
    userId,
    username,
    email,
    password: hashedPassword,
    accessTo: [],
    admin: isOwner || userAdmin,
    verified: verified || false,
    roleId: (roleId === 'admin' || roleId === 'user') ? null : roleId,
    owner: isOwner,
    permissions: {} // Legacy support
  };

  users.push(newUser);
  await db.set("users", users);

  invalidateCache("users");
  cache.delete("apiKeys_list");
  logAudit(req.user.userId, req.user.username, "user:create", req.ip);

  res.status(201).json(newUser);
});

router.delete("/user/delete", hasPermission("manage_users"), async (req, res) => {
  const userId = req.body.userId;
  let users = (await db.get("users")) || [];
  const userIndex = users.findIndex((user) => user.userId === userId);

  if (userIndex === -1) return res.status(400).send("The specified user does not exist");

  // Protect Owner
  if (users[userIndex].owner) {
    return res.status(403).send("Cannot delete the panel owner.");
  }

  users.splice(userIndex, 1);
  await db.set("users", users);

  logAudit(req.user.userId, req.user.username, "user:delete", req.ip);
  res.status(204).send();
});

router.get("/admin/users/edit/:userId", hasPermission("manage_users"), async (req, res) => {
  const userId = req.params.userId;
  const users = (await db.get("users")) || [];
  const editUser = users.find((user) => user.userId === userId);

  if (!editUser) return res.status(404).send("User not found");

  // Protect Owner: Only owner can edit themselves
  if (editUser.owner && req.user.userId !== userId) {
    return res.status(403).send("Only the owner can edit their own profile.");
  }

  const roles = await db.get("roles") || [];

  res.render("admin/users/edit", {
    req,
    user: req.user,
    editUser,
    roles
  });
});

router.post("/admin/users/edit/:userId", hasPermission("manage_users"), async (req, res, next) => {
  const userId = req.params.userId;
  const { username, email, password, roleId, verified } = req.body;

  let users = (await db.get("users")) || [];
  const userIndex = users.findIndex((user) => user.userId === userId);

  if (userIndex === -1) return res.status(404).send("User not found");

  const usernameTaken = users.some((u) => u.username === username && u.userId !== userId);
  const emailTaken = users.some((u) => u.email === email && u.userId !== userId);

  if (usernameTaken) return res.status(400).send("Username already exists.");
  if (emailTaken) return res.status(400).send("Email already exists.");

  // Protect Owner profile from being downgraded or modified by others
  if (users[userIndex].owner) {
    if (req.user.userId !== userId) {
      return res.status(403).send("Forbidden.");
    }
    users[userIndex].username = username;
    users[userIndex].email = email;
  } else {
    users[userIndex].username = username;
    users[userIndex].email = email;
    users[userIndex].admin = roleId === 'admin';
    users[userIndex].verified = verified === "true" || verified === true;
    users[userIndex].roleId = (roleId === 'admin' || roleId === 'user') ? null : roleId;
  }

  if (password && password.trim() !== "") {
    users[userIndex].password = await bcrypt.hash(password, saltRounds);
  }

  await db.set("users", users);
  logAudit(req.user.userId, req.user.username, "user:edit", req.ip);

  if (req.user.userId === userId) {
    return req.logout((err) => {
      if (err) return next(err);
      res.redirect("/login?err=UpdatedCredentials");
    });
  }

  res.redirect("/admin/users");
});

module.exports = router;
