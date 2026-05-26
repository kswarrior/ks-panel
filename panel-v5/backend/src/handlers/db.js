const Keyv = require("keyv");
const path = require("path");
const fs = require("node:fs");

let config = {};
try {
  config = require("../config.json");
} catch (e) {
  // config.json might not exist yet
}

// Env override - Only support KS SQL
const databaseURL = process.env.DB_URL || config.databaseURL || "ksql://admin:admin@127.0.0.1:5435/kspanel?sslmode=disable";
const databaseTable = process.env.DB_TABLE || config.databaseTable || "kspanel";

// Map ksql:// to postgres:// for the driver compatibility
const pgURL = databaseURL.replace("ksql://", "postgres://");

const PostgresStore = require("@keyvhq/postgres");
const store = new PostgresStore(pgURL, {
  table: databaseTable,
  keySize: 255,
});

const db = new Keyv({ store, namespace: 'kspanel' });

db.on('error', err => console.error('Keyv database error:', err));

/**
 * Helper to get all data from the database for migration or backup.
 * Only supports Postgres (KS SQL).
 */
async function getAllData() {
  const table = databaseTable;
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: pgURL });
  const res = await pool.query(`SELECT key, value FROM "${table}"`);
  await pool.end();
  return res.rows.map(row => {
      const parsed = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
      return { key: row.key.replace(/^kspanel:/, ''), value: parsed.value };
  });
}

module.exports = { db, getAllData, databaseURL: pgURL, originalURL: databaseURL, databaseTable };
