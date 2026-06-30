const { config, rootDir, isPkg, paths } = require("./utils/config.js");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const fs = require("node:fs");
const app = express();
const path = require("path");
const chalk = require("chalk");
const expressWs = require("express-ws")(app);
const translationMiddleware = require("./handlers/translation");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const analytics = require("./utils/analytics.js");
const crypto = require("node:crypto");

const { isAdmin, hasPermission, checkPermission, anyAdminPerm } = require("./utils/isAdmin.js");

const { loadPlugins } = require("./plugins/loadPls.js");
const pluginsDir = paths.plugins;
if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true });

let plugins = loadPlugins(pluginsDir);
plugins = Object.values(plugins).map((plugin) => plugin.config);

const { init } = require("./handlers/init.js");

const log = new (require("cat-loggr"))();
log.setLevel('debug');

require('dotenv').config();

if (process.env.DB_URL) config.databaseURL = process.env.DB_URL;
if (process.env.SESSION_SECRET) config.session_secret = process.env.SESSION_SECRET;

const { db } = require("./handlers/db.js");

const databaseURL = process.env.DB_URL || config.databaseURL || "sqlite://storage/database.sqlite";
let sessionStore;

if (databaseURL.startsWith("postgres")) {
  const PgSession = require('connect-pg-simple')(session);
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: databaseURL });
  sessionStore = new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  });
} else if (databaseURL.startsWith("mysql") || databaseURL.startsWith("mariadb")) {
  const MySQLStore = require('express-mysql-session')(session);
  sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000,
  }, require('mysql2/promise').createPool(databaseURL));
} else if (databaseURL.startsWith("mongodb")) {
  const MongoStore = require('connect-mongo');
  sessionStore = MongoStore.create({
    mongoUrl: databaseURL,
    collectionName: 'sessions',
    ttl: 30 * 24 * 60 * 60
  });
} else if (databaseURL.startsWith("sqlite")) {
  const SqliteStore = require('better-sqlite3-session-store')(session);
  const sqlitePathStr = databaseURL.replace("sqlite://", "");
  const sqlitePath = path.isAbsolute(sqlitePathStr) ? sqlitePathStr : path.resolve(rootDir, sqlitePathStr);
  const betterSqlite3 = require('better-sqlite3');
  const options = {};
  if (isPkg) {
    const req = eval('require');
    const p = req('path');
    options.nativeBinding = p.resolve(p.join(p.dirname(process.execPath), 'better_sqlite3.node'));
  }
  const dbSqlite = new betterSqlite3(sqlitePath, options);
  sessionStore = new SqliteStore({
    client: dbSqlite,
    expired: {
      clear: true,
      intervalMs: 900000
    }
  });
}

app.use(
  session({
    store: sessionStore,
    secret: config.session_secret || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: config.mode === "production",
      sameSite: "lax",
    },
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(analytics);
app.use(translationMiddleware);

app.use(async (req, res, next) => {
  if (req.path === "/setup/admin" || req.path.startsWith("/assets") || req.path.startsWith("/api/setup")) return next();

  const users = await db.get("users");
  if (!users || users.length === 0) {
    return res.redirect("/setup/admin");
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

let dynamicRateLimit = {
  windowMs: 5 * 60 * 1000,
  max: 5000
};

const rateLimitMiddleware = async (req, res, next) => {
  try {
    const security = await db.get("security_settings") || {};
    if (security.rateLimitWindow && security.rateLimitMax) {
      dynamicRateLimit.windowMs = parseInt(security.rateLimitWindow) * 60 * 1000;
      dynamicRateLimit.max = parseInt(security.max);
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

let netTraffic = { in: 0, out: 0, limit: 1024 * 1024 * 1024 };
db.get("security_settings").then(s => { if(s && s.networkLimit) netTraffic.limit = s.networkLimit * 1024 * 1024; });

app.use((req, res, next) => {
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
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many requests, please try again later",
});

app.use((req, res, next) => {
  if (req.method === "POST") {
    postRateLimiter(req, res, next);
  } else {
    next();
  }
});

function generateRandomString(length) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

function replaceRandomValues(obj) {
  let modified = false;
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      if (replaceRandomValues(obj[key])) modified = true;
    } else if (obj[key] === "Random") {
      obj[key] = generateRandomString(16);
      modified = true;
    }
  }
  return modified;
}

if (replaceRandomValues(config)) {
  const { saveConfig } = require("./utils/config.js");
  saveConfig(config);
  log.info("Config updated with random values.");
}

function getLanguages() {
  const langDir = paths.lang;
  if (!fs.existsSync(langDir)) return ["en"];
  return fs.readdirSync(langDir).map((file) => file.split(".")[0]);
}

app.get("/setLanguage", async (req, res) => {
  const lang = req.query.lang;
  if (lang && getLanguages().includes(lang)) {
    res.cookie("lang", lang, {
      maxAge: 90000000,
      httpOnly: true,
      sameSite: "strict",
    });
    if (req.user) req.user.lang = lang;
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

if (config.mode === "production") {
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
const publicDir = paths.public;
app.use(express.static(fs.existsSync(publicDir) ? publicDir : path.join(__dirname, "public")));

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

    res.locals.hasPerm = (perm) => {
      if (!req.user) return false;
      const dbUser = users.find(u => u.userId === req.user.userId);
      return checkPermission(dbUser, roles, perm);
    };

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

const routesDir = path.join(__dirname, "routes");
function loadRoutes(directory) {
  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadRoutes(fullPath);
    } else if (stat.isFile() && path.extname(file) === ".js") {
      log.debug('Loading route: ' + fullPath);
      const route = require(fullPath);
      expressWs.applyTo(route);
      app.use("/", route);
    }
  });
}
loadRoutes(routesDir);

const setupRoutes = require("./routes/Dashboard/Setup.js");
app.use("/", setupRoutes);

const events = require('./lib/plugin-events.js');
const pluginRoutes = require("./plugins/pluginManager.js");
pluginRoutes.setAppAndDb(app, db);
pluginRoutes.events = events;

app.use("/", pluginRoutes);

const pluginDir = paths.plugins;
const PluginViewsDir = fs.existsSync(pluginDir)
  ? fs.readdirSync(pluginDir)
      .filter(file => {
          try {
              return fs.statSync(path.join(pluginDir, file)).isDirectory();
          } catch (e) {
              return false;
          }
      })
      .map((addonName) => path.join(pluginDir, addonName, "views"))
      .filter(viewPath => fs.existsSync(viewPath))
  : [];

const baseViewsDir = fs.existsSync(paths.views) ? paths.views : path.join(__dirname, "views");
app.set("views", [baseViewsDir, ...PluginViewsDir]);

init();

app.set('trust proxy', 1);

const asciiPath = path.join(__dirname, "handlers/ascii.txt");
if (fs.existsSync(asciiPath)) {
  const ascii = fs.readFileSync(asciiPath, "utf8");
  console.log(chalk.gray(ascii.replace("{version}", config.version)));
}
const port = process.env.PORT || config.port || 3000;
app.listen(port, () => {
  log.info(`KS Panel is listening on port ${port}`);
});

events.emit('panelStart', { app, config });

app.use('*', async function(req, res){
  res.status(404).render('errors/404', {
    req,
    name: (await db.get('settings'))?.name || 'KS Panel'
  });
});
