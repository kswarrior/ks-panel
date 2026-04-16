const { db } = require("../handlers/db.js");

/**
 * Core permission check logic.
 * @param {Object} user - The user object (from DB).
 * @param {Array} roles - The list of roles (from DB).
 * @param {string} permission - The permission ID to check.
 * @returns {boolean}
 */
function checkPermission(user, roles, permission) {
  if (!user) return false;

  // Owners and Admins have all permissions
  if (user.owner === true || user.admin === true || String(user.admin) === 'true') {
    return true;
  }

  // 1. Direct permission check
  if (user.permissions && (user.permissions[permission] === true || user.permissions.all === true)) {
    return true;
  }

  // 2. Role-based permission check
  if (user.roleId) {
    const role = roles.find(r => r.id === user.roleId);
    if (role && role.permissions && (role.permissions[permission] === true || role.permissions[permission] === 'true' || role.permissions.all === true)) {
      return true;
    }
  }

  return false;
}

/**
 * Middleware to check if a user has a specific permission.
 * Owners (owner: true) and Admins (admin: true) have all permissions.
 * Also checks permissions from assigned Roles.
 */
function hasPermission(permission) {
  return async (req, res, next) => {
    if (!req.user) return res.redirect("/login");

    try {
      // Fetch the current user and roles from DB for fresh permissions check
      const [users, roles] = await Promise.all([
        db.get("users") || [],
        db.get("roles") || []
      ]);
      const dbUser = users.find(u => u.userId === req.user.userId);

      if (!dbUser) return res.redirect("/login");

      if (checkPermission(dbUser, roles, permission)) {
        return next();
      }

    } catch (err) {
      console.error("Permission check failed:", err);
    }

    // If no permission, redirect to dashboard
    return res.redirect("/instances");
  };
}

/**
 * Middleware to check if a user has ANY administrative permission.
 */
function anyAdminPerm(req, res, next) {
  if (!req.user) return res.redirect("/login");

  const adminPerms = [
    'create_instances', 'manage_nodes', 'manage_users',
    'manage_templates', 'view_audit_logs', 'manage_settings'
  ];

  // We can't easily do async check here without re-fetching,
  // but since we want to be safe, we re-fetch like hasPermission does.
  return (async () => {
    try {
      const [users, roles] = await Promise.all([
        db.get("users") || [],
        db.get("roles") || []
      ]);
      const dbUser = users.find(u => u.userId === req.user.userId);
      if (!dbUser) return res.redirect("/login");

      if (dbUser.owner || dbUser.admin || adminPerms.some(p => checkPermission(dbUser, roles, p))) {
        return next();
      }
    } catch (err) {
      console.error("anyAdminPerm check failed:", err);
    }
    return res.redirect("/instances");
  })();
}

// Legacy isAdmin middleware (now just a wrapper for 'all' permission)
async function isAdmin(req, res, next) {
  return hasPermission('all')(req, res, next);
}

module.exports = { isAdmin, hasPermission, checkPermission, anyAdminPerm };
