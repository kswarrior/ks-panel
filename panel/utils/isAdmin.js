const { db } = require("../handlers/db.js");

async function isAdmin(req, res, next) {
  // Check if user is authenticated via Passport
  if (req.user) {
    const username = req.user.username;

    // Safety fallback for primary admin accounts
    if (username === 'admin' || username === 'kshosting') {
      return next();
    }

    // Dynamic database check to handle permission changes in real-time
    try {
      const users = await db.get("users") || [];
      const dbUser = users.find(u => u.username === username);

      if (dbUser && (dbUser.admin === true || String(dbUser.admin) === 'true')) {
        return next();
      }
    } catch (err) {
      console.error("isAdmin middleware database check failed:", err);
      // Fallback to session data if DB is unreachable
      if (req.user.admin === true || String(req.user.admin) === 'true') {
        return next();
      }
    }
  }

  // Redirect to dashboard if logged in but not admin, otherwise to login
  if (req.user) {
    return res.redirect("/instances");
  } else {
    return res.redirect("/login");
  }
}

module.exports = { isAdmin };
