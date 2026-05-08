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
} else if (databaseURL.startsWith("mongodb")) {
  const MongoStore = require("@keyvhq/mongo");
  store = new MongoStore(databaseURL, {
    collection: databaseTable,
  });
} else {
  // Default to in-memory if protocol is unknown
  store = new Map();
  console.warn("Unknown database protocol, using in-memory store.");
}

const db = new Keyv({ store, namespace: 'kspanel' });

db.on('error', err => console.error('Keyv database error:', err));

/**
 * Helper to get all data from the database for migration or backup.
 * Keyv doesn't support this natively, so we query the underlying table.
 */
async function getAllData() {
  const table = databaseTable;

  if (databaseURL.startsWith("postgres")) {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: databaseURL });
    const res = await pool.query(`SELECT key, value FROM "${table}"`);
    await pool.end();
    return res.rows.map(row => {
        const parsed = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
        return { key: row.key.replace(/^kspanel:/, ''), value: parsed.value };
    });
  } else if (databaseURL.startsWith("mysql") || databaseURL.startsWith("mariadb")) {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection(databaseURL);
    const [rows] = await connection.execute(`SELECT \`key\`, \`value\` FROM \`${table}\``);
    await connection.end();
    return rows.map(row => {
        const parsed = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
        return { key: row.key.replace(/^kspanel:/, ''), value: parsed.value };
    });
  } else if (databaseURL.startsWith("sqlite")) {
    const sqlite = require('better-sqlite3')(databaseURL.replace("sqlite://", ""));
    const rows = sqlite.prepare(`SELECT key, value FROM "${table}"`).all();
    sqlite.close();
    return rows.map(row => {
        const parsed = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
        return { key: row.key.replace(/^kspanel:/, ''), value: parsed.value };
    });
  } else if (databaseURL.startsWith("mongodb")) {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(databaseURL);
    await client.connect();
    const dbName = databaseURL.split('/').pop().split('?')[0];
    const collection = client.db(dbName).collection(databaseTable);
    const cursor = collection.find({});
    const results = [];
    await cursor.forEach(doc => {
      // Keyv stores as { _id: 'namespace:key', value: { value: 'actual_value' } }
      const key = doc._id.replace(/^kspanel:/, '');
      let val = doc.value;
      if (typeof val === 'string') {
        try { val = JSON.parse(val); } catch (e) {}
      }
      results.push({ key, value: val.value });
    });
    await client.close();
    return results;
  }
  return [];
}

// Optional: Test connection on load (async, non-blocking)
db.get('__test_conn__').catch(() => {});

module.exports = { db, getAllData, databaseURL, databaseTable };
