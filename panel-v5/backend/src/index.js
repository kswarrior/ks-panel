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

const { db } = require("./handlers/db.js");
const { init } = require("./handlers/init.js");
const log = new (require("cat-loggr"))();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const SqliteStore = require('better-sqlite3-session-store')(session);
const dbSqlite = require('better-sqlite3')("storage/kspanel.sqlite");
app.use(session({
    store: new SqliteStore({ client: dbSqlite }),
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }
}));

app.use(passport.initialize());
app.use(passport.session());

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
app.listen(PORT, () => {
  log.info(`KS Panel v5 listening on port ${PORT}`);
});

app.use('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: "Not Found" });
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
