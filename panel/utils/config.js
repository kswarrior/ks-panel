const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Use process.cwd() or process.execPath for finding .env when packaged
const isPkg = typeof process.pkg !== 'undefined';
const baseDir = isPkg ? path.dirname(process.execPath) : path.join(__dirname, '../../');
const envPath = path.join(baseDir, '.env');

require('dotenv').config({ path: envPath });

function generateRandomString(length) {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

const config = {
  baseUri: process.env.BASE_URI || 'http://localhost:5050',
  port: parseInt(process.env.PORT) || 5050,
  session_secret: process.env.SESSION_SECRET || 'Random',
  domain: process.env.DOMAIN || 'localhost',
  mode: process.env.NODE_ENV || 'production',
  version: '1.0.0',
  databaseURL: process.env.DB_URL || 'sqlite://storage/kspanel.sqlite',
  databaseTable: process.env.DB_TABLE || 'kspanel',
  ogTitle: process.env.OG_TITLE || 'KS Panel',
  ogDescription: process.env.OG_DESCRIPTION || 'This is an instance of the KS Panel'
};

if (config.session_secret === 'Random') {
  config.session_secret = generateRandomString(32);
}

config.envPath = envPath;

module.exports = config;
