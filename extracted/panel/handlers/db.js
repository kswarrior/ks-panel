const config = require("../config.json");
if (!config.databaseURL) { 
  throw new Error("Database URL not set in config.json"); 
}

// Use full Keyv for EventEmitter support
const Keyv = require("keyv");
const PostgresStore = require("@keyvhq/postgres");

// Env override (if loaded elsewhere, e.g., index.js)
if (process.env.DB_URL) {
  config.databaseURL = process.env.DB_URL;
}

const store = new PostgresStore(config.databaseURL, {
  table: config.databaseTable || "kspanel",
  keySize: 255,  // Optional: Defaults to 255 for PG varchar
});

const db = new Keyv({ store });

db.on('error', err => console.error('Keyv PG error:', err));

// Optional: Test connection on load (async, non-blocking)
db.get('__test_conn__').catch(() => {});  // Triggers connect without data

module.exports = { db };
