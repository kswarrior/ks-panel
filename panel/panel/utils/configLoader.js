const fs = require('fs');
const path = require('path');

let config = {};
try {
  const configPath = path.join(__dirname, '../config.json');
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (e) {
  // config.json might not exist or be invalid
}

module.exports = config;
