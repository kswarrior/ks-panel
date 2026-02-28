const express = require('express');
const https = require('https');

const router = express.Router();

function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

router.get('/version', (req, res) => {
  const localVersion = require('../../../package.json').version; // Adjust path if routes are nested differently

  https.get('https://raw.githubusercontent.com/kswarrior/ks-panel/main/package.json', (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      try {
        const latestVersion = JSON.parse(data).version;
        const comparison = compareVersions(latestVersion, localVersion);
        const status = comparison > 0 ? 'outdated' : 'latest';
        res.json({ status, latestVersion, currentVersion: localVersion });
      } catch (error) {
        res.status(500).json({ error: 'Failed to parse latest version' });
      }
    });
  }).on('error', (error) => {
    res.status(500).json({ error: 'Failed to fetch latest version' });
  });
});

module.exports = router;
