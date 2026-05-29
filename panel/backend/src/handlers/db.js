const Keyv = require("keyv");
const path = require("path");
const fs = require("node:fs");

let config = {};
try {
  config = require("../config.json");
} catch (e) {
  // config.json might not exist yet
}

// Env override - Default to SQLite
const databaseURL = process.env.DB_URL || config.databaseURL || "sqlite://database.sqlite";
const databaseTable = process.env.DB_TABLE || config.databaseTable || "kspanel";

let store;
let connectionURL;

if (databaseURL.startsWith("postgres") || databaseURL.startsWith("ksql")) {
  connectionURL = databaseURL.replace("ksql://", "postgres://");
  try {
    const PostgresStore = require("@keyvhq/postgres");
    store = new PostgresStore(connectionURL, {
      table: databaseTable,
      keySize: 255,
    });
  } catch (e) {
    console.error("Postgres driver missing, falling back to SQLite");
    // Fallback to SQLite if PG driver is missing but URL is PG
    const dbPath = "database.sqlite";
    const absoluteDbPath = path.resolve(process.env.PANEL_CWD || process.cwd(), dbPath);
    const SQLiteStore = require("@keyvhq/sqlite");
    store = new SQLiteStore({
      uri: "sqlite://" + absoluteDbPath,
      table: databaseTable,
      keySize: 255,
    });
    connectionURL = "sqlite://" + absoluteDbPath;
  }
} else {
  connectionURL = databaseURL;
  const SQLiteStore = require("@keyvhq/sqlite");
  const dbPath = databaseURL.replace("sqlite://", "");
  const absoluteDbPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.env.PANEL_CWD || process.cwd(), dbPath);
  const dbDir = path.dirname(absoluteDbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  store = new SQLiteStore({
    uri: "sqlite://" + absoluteDbPath,
    table: databaseTable,
    keySize: 255,
  });
}

const db = new Keyv({ store, namespace: 'kspanel' });

db.on('error', err => console.error('Keyv database error:', err));

/**
 * Helper to get all data from the database for migration or backup.
 */
async function getAllData() {
  if (connectionURL.startsWith("postgres") || connectionURL.startsWith("ksql")) {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: connectionURL.replace("ksql://", "postgres://") });
    const res = await pool.query(`SELECT key, value FROM "${databaseTable}"`);
    await pool.end();
    return res.rows.map(row => {
        const parsed = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
        return { key: row.key.replace(/^kspanel:/, ''), value: parsed.value };
    });
  } else {
    const sqlite = require("better-sqlite3");
    const dbPath = connectionURL.replace("sqlite://", "");
    const absoluteDbPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.env.PANEL_CWD || process.cwd(), dbPath);
    const _db = new sqlite(absoluteDbPath);
    const rows = _db.prepare(`SELECT key, value FROM "${databaseTable}"`).all();
    _db.close();
    return rows.map(row => {
        const parsed = JSON.parse(row.value);
        return { key: row.key.replace(/^kspanel:/, ''), value: parsed.value };
    });
  }
}

module.exports = { db, getAllData, databaseURL: connectionURL, originalURL: databaseURL, databaseTable };
