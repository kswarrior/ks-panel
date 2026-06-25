const Keyv = require("keyv");
const path = require("path");
const fs = require("node:fs");

const isPkg = typeof process.pkg !== "undefined";
const rootDir = isPkg ? path.dirname(process.execPath) : path.join(__dirname, "..");

const { config } = require("../utils/config.js");

// Env override
const databaseURL = process.env.DB_URL || config.databaseURL || "sqlite://storage/database.sqlite";
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

  const sqlitePathStr = databaseURL.replace("sqlite://", "");
  const sqlitePath = path.isAbsolute(sqlitePathStr) ? sqlitePathStr : path.resolve(rootDir, sqlitePathStr);
  const dir = path.dirname(sqlitePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  store = new SQLiteStore("sqlite://" + sqlitePath, {
    table: databaseTable,
    keySize: 255,
  });

  try {
    const betterSqlite3 = require('better-sqlite3');
    const options = {};
    if (isPkg) {
      options.nativeBinding = path.join(path.dirname(process.execPath), 'better_sqlite3.node');
    }
    const sqlite = new betterSqlite3(sqlitePath, options);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('synchronous = NORMAL');
    sqlite.close();
  } catch (e) {
    console.error('Failed to set SQLite pragmas:', e);
  }
} else if (databaseURL.startsWith("mongodb")) {
  const MongoStore = require("@keyvhq/mongo");
  store = new MongoStore(databaseURL, {
    collection: databaseTable,
  });
} else {
  store = new Map();
  console.warn("Unknown database protocol, using in-memory store.");
}

const db = new Keyv({ store, namespace: 'kspanel' });

db.on('error', err => console.error('Keyv database error:', err));

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
    const sqlitePathStr = databaseURL.replace("sqlite://", "");
    const sqlitePath = path.isAbsolute(sqlitePathStr) ? sqlitePathStr : path.resolve(rootDir, sqlitePathStr);
    const betterSqlite3 = require('better-sqlite3');
    const options = {};
    if (isPkg) {
      options.nativeBinding = path.join(path.dirname(process.execPath), 'better_sqlite3.node');
    }
    const sqlite = new betterSqlite3(sqlitePath, options);
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

module.exports = { db, getAllData, databaseURL, databaseTable };
