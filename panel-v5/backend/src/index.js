const express = require("express");
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("node:fs");
const app = express();
const path = require("path");
const chalk = require("chalk");
const expressWs = require("express-ws")(app);
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const crypto = require("node:crypto");

app.use(cors({ origin: true, credentials: true }));

app.get("/ping", (req, res) => res.send("pong"));

const { db, databaseURL } = require("./handlers/db.js");
const { init } = require("./handlers/init.js");
const log = new (require("cat-loggr"))();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

let sessionStore;
if (databaseURL.startsWith("postgres") || databaseURL.startsWith("ksql")) {
  try {
    const PgStore = require('connect-pg-simple')(session);
    sessionStore = new PgStore({
        conString: databaseURL.replace("ksql://", "postgres://"),
        tableName: 'sessions',
        createTableIfMissing: true
    });
  } catch (e) {
    console.error("connect-pg-simple missing, falling back to SQLite for sessions");
    const SQLiteStore = require("better-sqlite3-session-store")(session);
    const sqlite = require("better-sqlite3");
    const sessionDbPath = path.resolve(process.env.PANEL_CWD || process.cwd(), "sessions.sqlite");
    const sessionDb = new sqlite(sessionDbPath);
    sessionStore = new SQLiteStore({
      client: sessionDb,
      tableName: "sessions",
    });
  }
} else {
  try {
    const SQLiteStore = require("better-sqlite3-session-store")(session);
    const sqlite = require("better-sqlite3");
    const dbPath = databaseURL.replace("sqlite://", "");
    const absoluteDbPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.env.PANEL_CWD || process.cwd(), dbPath);
    const sessionDb = new sqlite(absoluteDbPath);
    sessionStore = new SQLiteStore({
      client: sessionDb,
      tableName: "sessions",
    });
  } catch (e) {
    console.error("better-sqlite3-session-store missing, using memory store (NOT RECOMMENDED FOR PRODUCTION)");
  }
}

app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }
}));

app.use(passport.initialize());
app.use(passport.session());

app.locals.name = "KS Panel";
app.locals.logo = "https://avatars.githubusercontent.com/u/161421001?s=200&v=4";

app.use(async (req, res, next) => {
  try {
    const settings = await db.get("settings") || {};
    if (settings.name) res.locals.name = settings.name;
    if (settings.logo) res.locals.logo = settings.logo;
    res.locals.user = req.user;
    res.locals.req = req;
    next();
  } catch (error) {
    console.error("Error in settings middleware:", error);
    next();
  }
});

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

const routesDir = path.join(__dirname, "routes");
function loadRoutes(directory) {
  if (!fs.existsSync(directory)) return;
  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      loadRoutes(fullPath);
    } else if (file.endsWith(".js")) {
      const route = require(fullPath);
      if (typeof route === "function" || Object.getPrototypeOf(route) === express.Router) {
         expressWs.applyTo(route);
         app.use("/", route);
      }
    }
  });
}
loadRoutes(routesDir);

init();

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  log.info(`KS Panel v5 listening on port ${PORT} (0.0.0.0)`);
});

app.use('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: "Not Found" });
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
