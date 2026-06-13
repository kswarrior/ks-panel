const Fastify = require("fastify");
const fastifyCookie = require("@fastify/cookie");
const fastifyEnv = require("@fastify/env");
const fastifyFormBody = require("@fastify/formbody");
const fastifyMultipart = require("@fastify/multipart");
const passport = require("./handlers/passport");
const fastifyRateLimit = require("@fastify/rate-limit");
const fastifySession = require("@fastify/session");
const fastifyStatic = require("@fastify/static");
const fastifyView = require("@fastify/view");
const fastifyWebsocket = require("@fastify/websocket");
const legacySessionStoreFactory = require("express-session");
const fs = require("node:fs");
const path = require("path");
const chalk = require("chalk");
const ejs = require("ejs");
const translationMiddleware = require("./handlers/translation");
const analytics = require("./utils/analytics.js");
const { anyAdminPerm, checkPermission } = require("./utils/isAdmin.js");
const { decorateRequestReply, registerRouter, runHandlers } = require("./lib/fastify-route-bridge");
const { loadPlugins } = require("./plugins/loadPls.js");
const { init } = require("./handlers/init.js");
const { db } = require("./handlers/db.js");
const config = require("./utils/config.js");

const log = new (require("cat-loggr"))();
log.setLevel("debug");

const pluginsDir = path.join(__dirname, "../database/plugins");
if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true });
let plugins = loadPlugins(pluginsDir);
plugins = Object.values(plugins).map((plugin) => plugin.config);

const databaseURL = config.databaseURL;
let sessionStore;

if (databaseURL.startsWith("postgres")) {
  const PgSession = require("connect-pg-simple")(legacySessionStoreFactory);
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: databaseURL });
  sessionStore = new PgSession({ pool, tableName: "session", createTableIfMissing: true });
} else if (databaseURL.startsWith("mysql") || databaseURL.startsWith("mariadb")) {
  const MySQLStore = require("express-mysql-session")(legacySessionStoreFactory);
  sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000,
  }, require("mysql2/promise").createPool(databaseURL));
} else if (databaseURL.startsWith("mongodb")) {
  const MongoStore = require("connect-mongo");
  sessionStore = MongoStore.create({ mongoUrl: databaseURL, collectionName: "sessions", ttl: 30 * 24 * 60 * 60 });
} else if (databaseURL.startsWith("sqlite")) {
  const SqliteStore = require("better-sqlite3-session-store")(legacySessionStoreFactory);
  const dbSqlite = require("better-sqlite3")(databaseURL.replace("sqlite://", ""));
  sessionStore = new SqliteStore({ client: dbSqlite, expired: { clear: true, intervalMs: 900000 } });
}

function getLanguages() {
  return fs.readdirSync(path.join(__dirname, "lang")).map((file) => file.split(".")[0]);
}

function addMiddlewareHook(app, hook, handlers) {
  app.addHook(hook, async (request, reply) => {
    decorateRequestReply(request, reply);
    await runHandlers(handlers, request, reply);
  });
}

async function buildServer() {
  const app = Fastify({
    trustProxy: true,
    logger: false,
    bodyLimit: 100 * 1024 * 1024,
    connectionTimeout: 0,
    keepAliveTimeout: 0,
  });

  await app.register(fastifyEnv, {
    dotenv: true,
    schema: {
      type: "object",
      properties: {
        DB_URL: { type: "string" },
        SESSION_SECRET: { type: "string" },
        NODE_ENV: { type: "string", default: config.mode || "development" },
        PORT: { type: "string", default: String(config.port || 3000) },
      },
    },
  });

  await app.register(fastifyCookie);
  await app.register(fastifyFormBody);
  await app.register(fastifyMultipart, { attachFieldsToBody: false, limits: { fileSize: 100 * 1024 * 1024 } });
  await app.register(fastifyWebsocket);
  await app.register(fastifyRateLimit, {
    global: false,
    max: 10000,
    timeWindow: 5 * 60 * 1000,
  });
  await app.register(fastifySession, {
    store: sessionStore,
    secret: config.session_secret || "secretsecretsecretsecretsecretsecret",
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  });
  await app.register(passport.initialize());
  await app.register(passport.secureSession());

  await app.register(fastifyView, {
    engine: { ejs },
    root: path.join(__dirname, "views"),
    viewExt: "ejs",
  });

  addMiddlewareHook(app, "preHandler", [analytics, translationMiddleware]);

  app.addHook("preHandler", async (req, reply) => {
    decorateRequestReply(req, reply);
    if (req.path === "/setup/admin" || req.path.startsWith("/assets") || req.path.startsWith("/api/setup") || req.path === "/favicon.ico") return;
    const users = await db.get("users");
    if (!users || users.length === 0) {
        reply.redirect("/setup/admin");
        return;
    }
  });

  app.addHook("preHandler", async (req, reply) => {
    try {
      const security = (await db.get("security_settings")) || {};
      const max = security.rateLimitMax ? parseInt(security.rateLimitMax) : 10000;
      const timeWindow = security.rateLimitWindow ? parseInt(security.rateLimitWindow) * 60 * 1000 : 5 * 60 * 1000;
      await app.rateLimit({ max, timeWindow, keyGenerator: (request) => request.ip })(req, reply);
    } catch (error) {
      if (error && error.statusCode === 429) throw error;
    }
  });

  let netTraffic = { in: 0, out: 0, limit: 1024 * 1024 * 1024 };
  db.get("security_settings").then((s) => { if (s && s.networkLimit) netTraffic.limit = s.networkLimit * 1024 * 1024; });

  app.addHook("onRequest", async (req, reply) => {
    if (netTraffic.limit > 0 && (netTraffic.in + netTraffic.out) >= netTraffic.limit) {
      reply.code(429).send("System Security: Network throughput quota exceeded.");
      return;
    }
    netTraffic.in += parseInt(req.headers["content-length"]) || 0;
  });

  app.addHook("onSend", async (_req, _reply, payload) => {
    if (payload && payload.length) netTraffic.out += payload.length;
    return payload;
  });

  app.get("/api/security/traffic", { preHandler: async (req, reply) => runHandlers([anyAdminPerm], req, reply) }, async () => netTraffic);

  app.addHook("preHandler", async (req, reply) => {
    if (req.method === "POST") {
      await app.rateLimit({ max: 60, timeWindow: 60 * 1000 })(req, reply);
    }
  });

  app.get("/setLanguage", async (req, reply) => {
    const lang = req.query.lang;
    if (lang && getLanguages().includes(lang)) {
      reply.setCookie("lang", lang, { maxAge: 90000000, httpOnly: true, sameSite: "strict" });
      if (req.user) req.user.lang = lang;
      reply.code(200);
      return { success: true };
    }
    reply.code(200);
    return { success: false };
  });

  if (config.mode === "production") {
    app.addHook("onSend", async (req, reply, payload) => {
      if (req.url.startsWith("/assets")) {
        reply.header("Cache-Control", "public, max-age=1");
      } else {
        reply.header("Cache-Control", "no-store");
        reply.header("Pragma", "no-cache");
        reply.header("Expires", "5");
      }
      return payload;
    });
  }

  await app.register(fastifyStatic, {
    root: path.join(__dirname, "public"),
    prefix: "/",
  });

  app.addHook("preHandler", async (req, reply) => {
    decorateRequestReply(req, reply);
    try {
      const [settings, theme, users, roles] = await Promise.all([
        db.get("settings") || {},
        db.get("theme") || {},
        db.get("users") || [],
        db.get("roles") || [],
      ]);

      reply.locals.languages = getLanguages();
      reply.locals.ogTitle = config.ogTitle;
      reply.locals.ogDescription = config.ogDescription;
      reply.locals.footer = settings.footer || "";
      reply.locals.name = settings.name || "KS Panel";
      reply.locals.logo = settings.logo || "/assets/logo.webp";
      reply.locals.notifications = req.user ? (await db.get(`notifications_${req.user.userId}`) || []) : [];
      reply.locals.plugins = plugins;
      reply.locals.theme = theme;
      reply.locals.hasPerm = (perm) => {
        if (!req.user) return false;
        const dbUser = users.find((u) => u.userId === req.user.userId);
        return checkPermission(dbUser, roles, perm);
      };
      reply.locals.anyAdminPerm = () => {
        if (!req.user) return false;
        const dbUser = users.find((u) => u.userId === req.user.userId);
        if (dbUser && (dbUser.owner || dbUser.admin)) return true;
        const adminPerms = ["create_instances", "manage_nodes", "manage_users", "manage_templates", "view_audit_logs", "manage_settings", "view_insights"];
        return adminPerms.some((p) => checkPermission(dbUser, roles, p));
      };
      reply.locals.req = req;
    } catch (err) {
      log.error("Global locals middleware error:", err);
      reply.locals.languages = getLanguages();
      reply.locals.theme = {};
      reply.locals.hasPerm = () => false;
      reply.locals.anyAdminPerm = () => false;
      reply.locals.name = "KS Panel";
      reply.locals.plugins = plugins;
    }
  });

  const routesDir = path.join(__dirname, "routes");
  function loadRoutes(directory) {
    fs.readdirSync(directory).forEach((file) => {
      const fullPath = path.join(directory, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) return loadRoutes(fullPath);
      if (stat.isFile() && path.extname(file) === ".js") {
        console.log("Loading route:", fullPath);
        registerRouter(app, require(fullPath));
      }
    });
  }
  loadRoutes(routesDir);

  const events = require("./lib/plugin-events.js");
  const pluginRoutes = require("./plugins/pluginManager.js");
  pluginRoutes.setAppAndDb(app, db);
  pluginRoutes.events = events;
  registerRouter(app, pluginRoutes);

  app.setNotFoundHandler(async (req, reply) => {
    decorateRequestReply(req, reply);
    reply.code(404);
    return reply.view("errors/404", {
      req,
      name: (await db.get("settings"))?.name || "KS Panel",
    });
  });

  init();

  events.emit("panelStart", { app, config });
  return app;
}

async function start() {
  const app = await buildServer();
  const port = Number(config.port || 3000);

  const asciiPath = path.join(__dirname, "handlers/ascii.txt");
  if (fs.existsSync(asciiPath)) {
    const ascii = fs.readFileSync(asciiPath, "utf8");
    console.log(chalk.gray(ascii.replace("{version}", config.version)));
  }

  await app.listen({ port, host: "0.0.0.0" });
  log.info(`KS Panel is listening on port ${port}`);
  log.debug("Server ready - routes loaded");
}

if (require.main === module || process.env.KSPANEL_CLI_LAUNCH === "true") {
  start().catch((error) => {
    log.error(error);
    process.exit(1);
  });
}

module.exports = { buildServer, start };
