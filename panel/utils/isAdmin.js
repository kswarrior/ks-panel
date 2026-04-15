const { db } = require("../handlers/db.js");

/**
 * Middleware to check if a user has a specific permission.
 * Owners (owner: true) and Admins (admin: true) have all permissions.
 * Also checks permissions from assigned Roles.
 */
function hasPermission(permission) {
  return async (req, res, next) => {
    if (!req.user) return res.redirect("/login");

    // Use session data for immediate checks (Owner/Admin)
    if (req.user.owner === true || req.user.admin === true || String(req.user.admin) === 'true') {
      return next();
    }

    try {
      // Fetch ONLY the current user from DB for fresh permissions check
      const users = await db.get("users") || [];
      const dbUser = users.find(u => u.userId === req.user.userId);

      if (!dbUser) return res.redirect("/login");

      // Verify Owner/Admin status from DB
      if (dbUser.owner === true || dbUser.admin === true || String(dbUser.admin) === 'true') {
        return next();
      }

      // 1. Direct permission check
      if (dbUser.permissions && (dbUser.permissions[permission] === true || dbUser.permissions.all === true)) {
        return next();
      }

      // 2. Role-based permission check
      if (dbUser.roleId) {
        const roles = await db.get("roles") || [];
        const role = roles.find(r => r.id === dbUser.roleId);
        if (role && role.permissions && (role.permissions[permission] === true || role.permissions[permission] === 'true' || role.permissions.all === true)) {
          return next();
        }
      }

    } catch (err) {
      console.error("Permission check failed:", err);
    }

    // If no permission, redirect to dashboard
    return res.redirect("/instances");
  };
}

// Legacy isAdmin middleware (now just a wrapper for 'all' permission)
async function isAdmin(req, res, next) {
  return hasPermission('all')(req, res, next);
}

module.exports = { isAdmin, hasPermission };
