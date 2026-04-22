const express = require("express");
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const fs = require("node:fs");
const ascii = fs.readFileSync("./handlers/ascii.txt", "utf8");
const app = express();
const path = require("path");
const chalk = require("chalk");
const expressWs = require("express-ws")(app);
const translationMiddleware = require("./handlers/translation");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const analytics = require("./utils/analytics.js");
const crypto = require("node:crypto");

const PgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

const { isAdmin, hasPermission, checkPermission, anyAdminPerm } = require("./utils/isAdmin.js");

const { loadPlugins } = require("./plugins/loadPls.js");
let plugins = loadPlugins(path.join(__dirname, "./plugins"));
plugins = Object.values(plugins).map((plugin) => plugin.config);

const { init } = require("./handlers/init.js");

const log = new (require("cat-loggr"))();
log.setLevel('debug');  // Enable debug/info logs (change to 'info' in production)

require('dotenv').config();  // Load env vars FIRST

const config = require("./config.json");  // Load config ONCE, after env

// Override config with env if set
if (process.env.DB_URL) config.databaseURL = process.env.DB_URL;
if (process.env.SESSION_SECRET) config.session_secret = process.env.SESSION_SECRET;

const { db } = require("./handlers/db.js");  // Assumes db.js uses the updated config/databaseURL

const pool = new Pool({ connectionString: config.databaseURL });

app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true
    }),
    secret: config.session_secret || "secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days - more reasonable default
      httpOnly: true,
      secure: config.mode === "production",
      sameSite: "lax",
    },
  })
);

/**
 * Initializes the Express application with necessary middleware for parsing HTTP request bodies,
 * handling sessions, and integrating WebSocket functionalities. It sets EJS as the view engine,
 * reads route files from the 'routes' directory, and applies WebSocket enhancements to each route.
 * Finally, it sets up static file serving and starts listening on a specified port.
 */
app.use(bodyParser.urlencoded({ extended: true })); // true is usually better
app.use(bodyParser.json());
app.use(cookieParser());
app.use(analytics);
app.use(translationMiddleware);
app.use(passport.initialize());
app.use(passport.session());

/**
 * Dynamic Rate Limiter
 * Fetches settings from DB to allow live updates without restart.
 */
let dynamicRateLimit = {
  windowMs: 5 * 60 * 1000,
  max: 5000
};

const rateLimitMiddleware = async (req, res, next) => {
  try {
    const security = await db.get("security_settings") || {};
    if (security.rateLimitWindow && security.rateLimitMax) {
      dynamicRateLimit.windowMs = parseInt(security.rateLimitWindow) * 60 * 1000;
      dynamicRateLimit.max = parseInt(security.rateLimitMax);
    }
  } catch (e) {}

  return rateLimit({
    windowMs: dynamicRateLimit.windowMs,
    max: dynamicRateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Rate limit exceeded. Too many requests from this IP.",
    keyGenerator: (req) => req.ip
  })(req, res, next);
};

app.use(rateLimitMiddleware);

// --- Network Traffic Tracking & Enforcement ---
let netTraffic = { in: 0, out: 0, limit: 1024 * 1024 * 1024 }; // Default 1GB
db.get("security_settings").then(s => { if(s && s.networkLimit) netTraffic.limit = s.networkLimit * 1024 * 1024; });

app.use((req, res, next) => {
  // Block if limit reached
  if (netTraffic.limit > 0 && (netTraffic.in + netTraffic.out) >= netTraffic.limit) {
    return res.status(429).send("System Security: Network throughput quota exceeded.");
  }

  netTraffic.in += parseInt(req.headers['content-length']) || 0;
  const originalWrite = res.write;
  const originalEnd = res.end;
  res.write = function (chunk) {
    if (chunk && chunk.length) netTraffic.out += chunk.length;
    return originalWrite.apply(res, arguments);
  };
  res.end = function (chunk) {
    if (chunk && chunk.length) netTraffic.out += chunk.length;
    return originalEnd.apply(res, arguments);
  };
  next();
});
app.get("/api/security/traffic", anyAdminPerm, (req, res) => res.json(netTraffic));

const postRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: "Too many requests, please try again later",
});

app.use((req, res, next) => {
  if (req.method === "POST") {
    postRateLimiter(req, res, next);
  } else {
    next();
  }
});

/**
 * Generates a random 16-character hexadecimal string.
 *
 * @param {number} length - The length of the string to generate.
 * @returns {string} - The generated string.
 */
function generateRandomString(length) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

/**
 * Recursively traverses an object and replaces any value that is exactly "random"
 * with a randomly generated string.
 *
 * @param {Object} obj - The object to traverse.
 */
function replaceRandomValues(obj) {
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      replaceRandomValues(obj[key]);
    } else if (obj[key] === "Random") {
      obj[key] = generateRandomString(16);
    }
  }
}

/**
 * Updates the config.json file by replacing "random" values with random strings.
 */
async function updateConfig() {
  const configPath = "./config.json";

  try {
    let configData = fs.readFileSync(configPath, "utf8");
    let configObj = JSON.parse(configData);

    replaceRandomValues(configObj);
    fs.writeFileSync(configPath, JSON.stringify(configObj, null, 2), "utf8");
    log.info("Config updated with random values.");
  } catch (error) {
    log.error("Error updating config:", error);
  }
}

updateConfig();

function getLanguages() {
  return fs.readdirSync(__dirname + "/lang").map((file) => file.split(".")[0]);
}

app.get("/setLanguage", async (req, res) => {
  const lang = req.query.lang;
  if (lang && getLanguages().includes(lang)) {
    res.cookie("lang", lang, {
      maxAge: 90000000,
      httpOnly: true,
      sameSite: "strict",
    });
    req.user.lang = lang;
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

if (config.mode === "production" || false) {
  app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "5");
    next();
  });

  app.use("/assets", (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=1");
    next();
  });
}

app.set("view engine", "ejs");
/**
 * Configures the Express application to serve static files from the 'public' directory, providing
 * access to client-side resources like images, JavaScript files, and CSS stylesheets without additional
 * routing. The server then starts listening on a port defined in the configuration file, logging the port
 * number to indicate successful startup.
 */
app.use(express.static("public"));

/**
 * Dynamically loads all route modules from the 'routes' directory, applying WebSocket support to each.
 * Logs the loaded routes and mounts them to the Express application under the root path. This allows for
 * modular route definitions that can be independently maintained and easily scaled.
 */

// ====================== GLOBAL VIEW LOCALS & SETTINGS ======================
app.use(async (req, res, next) => {
  try {
    const [settings, theme, users, roles] = await Promise.all([
      db.get("settings") || {},
      db.get("theme") || {},
      db.get("users") || [],
      db.get("roles") || []
    ]);

    res.locals.languages = getLanguages();
    res.locals.ogTitle = config.ogTitle;
    res.locals.ogDescription = config.ogDescription;
    res.locals.footer = settings.footer || "";
    res.locals.name = settings.name || "KS Panel";
    res.locals.logo = settings.logo || "/assets/logo.webp";
    res.locals.notifications = req.user ? (await db.get(`notifications_${req.user.userId}`) || []) : [];
    res.locals.plugins = plugins;
    res.locals.theme = theme;
    res.locals.userBalance = req.user ? (users.find(u => u.userId === req.user.userId)?.credits || 0) : 0;
    res.locals.user = req.user;

    // Permission helper for EJS
    res.locals.hasPerm = (perm) => {
      if (!req.user) return false;
      const dbUser = users.find(u => u.userId === req.user.userId);
      return checkPermission(dbUser, roles, perm);
    };

    // Helper to check if user has ANY admin permission
    res.locals.anyAdminPerm = () => {
      if (!req.user) return false;
      const dbUser = users.find(u => u.userId === req.user.userId);
      if (dbUser && (dbUser.owner || dbUser.admin)) return true;

      const adminPerms = [
        'create_instances', 'manage_nodes', 'manage_users',
        'manage_templates', 'view_audit_logs', 'manage_settings', 'view_insights'
      ];
      return adminPerms.some(p => checkPermission(dbUser, roles, p));
    };

    // Helper for path check in templates
    res.locals.req = req;

  } catch (err) {
    log.error("Global locals middleware error:", err);
    res.locals.languages = getLanguages();
    res.locals.theme = {};
    res.locals.hasPerm = () => false;
    res.locals.anyAdminPerm = () => false;
    res.locals.name = "KS Panel";
    res.locals.plugins = plugins;
  }
  next();
});

// --- Automated Renewal & Expiry Task ---
setInterval(async () => {
  try {
    const billing = await db.get("billing_settings");
    if (!billing || !billing.enabled) return;

    const instances = await db.get("instances") || [];
    const users = await db.get("users") || [];

    for (const inst of instances) {
      const instance = await db.get(`${inst.Id}_instance`);
      if (!instance || !instance.expiresAt) continue;

      const expiry = new Date(instance.expiresAt);
      if (expiry < new Date()) {
        // Expired! Try to renew automatically if user has credits
        const userIdx = users.findIndex(u => u.userId === instance.User);
        const cost = parseFloat(billing.renewalCost) || 10;
        const interval = parseInt(billing.renewalInterval) || 30;
        const unit = billing.renewalUnit || 'days';

        let extensionMs = interval * 24 * 60 * 60 * 1000;
        if (unit === 'hours') extensionMs = interval * 60 * 60 * 1000;
        else if (unit === 'seconds') extensionMs = interval * 1000;

        if (userIdx !== -1 && (users[userIdx].credits || 0) >= cost) {
          // Auto-renew
          users[userIdx].credits -= cost;
          instance.expiresAt = new Date(Date.now() + extensionMs).toISOString();
          instance.suspended = false;
          await db.set(`${instance.Id}_instance`, instance);
          log.info(`Auto-renewed instance ${instance.Id} for user ${users[userIdx].username}`);
        } else {
          // Suspend
          if (!instance.suspended) {
            instance.suspended = true;
            await db.set(`${instance.Id}_instance`, instance);
            log.warn(`Suspended instance ${instance.Id} due to expiration/insufficient credits`);
          }
        }
      }
    }
    await db.set("users", users);
  } catch (err) {
    log.error("Renewal task error:", err);
  }
}, 60 * 60 * 1000); // Check every hour

const routesDir = path.join(__dirname, "routes");
function loadRoutes(directory) {
  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadRoutes(fullPath);
    } else if (stat.isFile() && path.extname(file) === ".js") {
      console.log('Loading route:', fullPath); const route = require(fullPath);
      expressWs.applyTo(route);

      if (fullPath.includes(path.join("routes", "Admin"))) {
        app.use("/", route);
      } else {
        app.use("/", route);
      }
    }
  });
}
loadRoutes(routesDir);

// ────────────────────────────────────────────────────────────────
// ENHANCED PLUGIN SYSTEM (like Pterodactyl Blueprint but .kspp)
// ────────────────────────────────────────────────────────────────

// NEW: Load centralized event system for plugin hooks
const events = require('./lib/plugin-events.js');

// NEW: Pass events, app, and db to plugin manager for deep integration
const pluginRoutes = require("./plugins/pluginManager.js");
pluginRoutes.setAppAndDb(app, db);           // Inject app + db for plugins
pluginRoutes.events = events;                 // Inject events for hooks

app.use("/", pluginRoutes);

// Plugin views support (unchanged)
const pluginDir = path.join(__dirname, "plugins");
const PluginViewsDir = fs
  .readdirSync(pluginDir)
  .map((addonName) => path.join(pluginDir, addonName, "views"));
app.set("views", [path.join(__dirname, "views"), ...PluginViewsDir]);

// ────────────────────────────────────────────────────────────────

// Init
init();

app.set('trust proxy', 1);

console.log(chalk.gray(ascii.replace("{version}", config.version)));
app.listen(config.port, () => {
  log.info(`KS Panel is listening on port ${config.port}`);
  log.debug('Server ready - routes loaded');
});

// NEW: Emit a startup event for plugins to react
events.emit('panelStart', { app, config });

// 404 handler (MUST be last route)
app.use('*', async function(req, res){
  res.status(404).render('errors/404', {
    req,
    name: (await db.get('settings'))?.name || 'KS Panel'
  });
});
