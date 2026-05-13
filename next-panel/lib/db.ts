import Keyv from "keyv";

const databaseURL = process.env.DB_URL || "sqlite://storage/kspanel.sqlite";
const databaseTable = process.env.DB_TABLE || "kspanel";

let store: any;

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
  store = new Map();
  console.warn("Unknown database protocol, using in-memory store.");
}

export const db = new Keyv({ store, namespace: 'kspanel' });

db.on('error', (err: any) => console.error('Keyv database error:', err));
