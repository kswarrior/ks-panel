const Keyv = require("keyv");
const path = require("path");
const fs = require("node:fs");

let config = {};
try {
  config = require("../config.json");
} catch (e) {
  // config.json might not exist yet
}

// Env override
const databaseURL = process.env.DB_URL || config.databaseURL || "sqlite://storage/kspanel.sqlite";
const databaseTable = process.env.DB_TABLE || config.databaseTable || "kspanel";

let store;

if (databaseURL.startsWith("postgres")) {
  const PostgresStore = require("@keyvhq/postgres");
  store = new PostgresStore(databaseURL, {
    table: databaseTable,
    keySize: 255,
  });
} else if (databaseURL.startsWith("mysql") || databaseURL.startsWith("mariadb")) {
  const MySQLStore = require("@keyvhq/mysql");
  store = new MySQLStore(databaseURL, {
    table: databaseTable,
    keySize: 255,
  });
} else if (databaseURL.startsWith("sqlite")) {
  const SQLiteStore = require("@keyvhq/sqlite");

  // Ensure the storage directory exists for sqlite
  const sqlitePath = databaseURL.replace("sqlite://", "");
  const dir = path.dirname(path.resolve(__dirname, "..", sqlitePath));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  store = new SQLiteStore(databaseURL, {
    table: databaseTable,
    keySize: 255,
  });
} else {
  // Default to in-memory if protocol is unknown
  store = new Map();
  console.warn("Unknown database protocol, using in-memory store.");
}

const db = new Keyv({ store });

db.on('error', err => console.error('Keyv database error:', err));

// Optional: Test connection on load (async, non-blocking)
db.get('__test_conn__').catch(() => {});

module.exports = { db };
