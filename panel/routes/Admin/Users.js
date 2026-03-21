const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { db } = require("../../handlers/db.js");
const { logAudit } = require("../../handlers/auditLog.js");
const { isAdmin } = require("../../utils/isAdmin.js");
const { getPaginatedUsers, invalidateCache } = require("../../utils/dbHelper.js");
const cache = require("../../utils/cache.js");

const saltRounds = 10;

// ==================== EXISTENCE CHECKS ====================
async function doesUserExist(username) {
  const users = await db.get("users");
  return users ? users.some((user) => user.username === username) : false;
}

async function doesEmailExist(email) {
  const users = await db.get("users");
  return users ? users.some((user) => user.email === email) : false;
}

// ==================== ROUTES ====================

// ── OVERVIEW (List) ──
router.get("/admin/users", isAdmin, async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 20;

  const usersResult = await getPaginatedUsers(page, pageSize);

  res.render("admin/users/overview", {
    req,
    user: req.user,
    users: usersResult.data,
    pagination: usersResult.pagination,
  });
});

// ── CREATE FORM PAGE ── (NEW ROUTE)
router.get("/admin/users/create", isAdmin, (req, res) => {
  res.render("admin/users/create", {
    req,
    user: req.user,
  });
});

// ── CREATE USER (API) ──
router.post("/users/create", isAdmin, async (req, res) => {
  const { username, email, password, admin, verified } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send("Username, email, and password are required.");
  }

  if (typeof admin !== "boolean") {
    return res.status(400).send("Admin field must be true or false.");
  }

  if (await doesUserExist(username)) {
    return res.status(400).send("User already exists.");
  }
  if (await doesEmailExist(email)) {
    return res.status(400).send("Email already exists.");
  }

  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = {
    userId,
    username,
    email,
    password: hashedPassword,
    accessTo: [],
    admin,
    verified: verified || false,
  };

  let users = (await db.get("users")) || [];
  users.push(newUser);
  await db.set("users", users);

  invalidateCache("users");
  cache.delete("apiKeys_list");
  logAudit(req.user.userId, req.user.username, "user:create", req.ip);

  res.status(201).json(newUser); // Changed to .json() for cleaner frontend handling
});

// ── DELETE USER ──
router.delete("/user/delete", isAdmin, async (req, res) => {
  const userId = req.body.userId;
  const users = (await db.get("users")) || [];

  const userIndex = users.findIndex((user) => user.userId === userId);
  if (userIndex === -1) {
    return res.status(400).send("The specified user does not exist");
  }

  users.splice(userIndex, 1);
  await db.set("users", users);

  logAudit(req.user.userId, req.user.username, "user:delete", req.ip);
  res.status(204).send();
});

// ── EDIT FORM PAGE ── (Updated render path to match new structure)
router.get("/admin/users/edit/:userId", isAdmin, async (req, res) => {
  const userId = req.params.userId;
  const users = (await db.get("users")) || [];
  const editUser = users.find((user) => user.userId === userId);

  if (!editUser) {
    return res.status(404).send("User not found");
  }

  res.render("admin/users/edit", {
    req,
    user: req.user,
    editUser,
  });
});

// ── EDIT USER (POST) ──
router.post("/admin/users/edit/:userId", isAdmin, async (req, res, next) => {
  const userId = req.params.userId;
  const { username, email, password, admin, verified } = req.body;

  if (!username || !email) {
    return res.status(400).send("Username and email are required.");
  }

  const users = (await db.get("users")) || [];
  const userIndex = users.findIndex((user) => user.userId === userId);

  if (userIndex === -1) {
    return res.status(404).send("User not found");
  }

  const usernameTaken = users.some(
    (u) => u.username === username && u.userId !== userId
  );
  const emailTaken = users.some(
    (u) => u.email === email && u.userId !== userId
  );

  if (usernameTaken) return res.status(400).send("Username already exists.");
  if (emailTaken) return res.status(400).send("Email already exists.");

  // Update fields
  users[userIndex].username = username;
  users[userIndex].email = email;
  users[userIndex].admin = admin === "true";
  users[userIndex].verified = verified === "true";

  if (password && password.trim() !== "") {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    users[userIndex].password = hashedPassword;
  }

  await db.set("users", users);
  logAudit(req.user.userId, req.user.username, "user:edit", req.ip);

  // If the admin edited themselves → force re-login
  if (req.user.userId === userId) {
    return req.logout((err) => {
      if (err) return next(err);
      res.redirect("/login?err=UpdatedCredentials");
    });
  }

  res.redirect("/admin/users");
});

module.exports = router;
