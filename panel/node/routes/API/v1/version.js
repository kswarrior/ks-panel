const express = require('express');
const https = require('https');
const { exec } = require('child_process');

const router = express.Router();

function compareVersions(v1, v2) {
  // Remove 'v' prefix if present and split into numbers
  const clean = (v) => v.replace(/^v/, '').split('.').map(Number);
  const parts1 = clean(v1);
  const parts2 = clean(v2);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

router.get('/version', (req, res) => {
  const localVersion = require('../../../package.json').version; // Adjust path if needed

  const options = {
    hostname: 'api.github.com',
    path: '/repos/kswarrior/ks-panel/releases/latest',
    headers: {
      'User-Agent': 'KS-Panel-Version-Checker' // GitHub API requires a User-Agent
    }
  };

  https.get(options, (response) => {
    if (response.statusCode !== 200) {
      return res.status(500).json({ 
        error: `GitHub API returned ${response.statusCode}` 
      });
    }

    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        const release = JSON.parse(data);
        const latestVersion = release.tag_name; // e.g. "v1.0.0" or "1.0.0"

        // Optional: you can also get the zip URL if you want to show it or use it later
        const zipAsset = release.assets.find(asset => 
          asset.name.toLowerCase().includes('ks-panel.zip') || 
          asset.name.endsWith('.zip')
        );
        const zipUrl = zipAsset ? zipAsset.browser_download_url : null;

        const comparison = compareVersions(latestVersion, localVersion);
        const status = comparison > 0 ? 'outdated' : 'latest';

        res.json({ 
          status, 
          latestVersion, 
          currentVersion: localVersion,
          zipUrl // optional – you can use this in frontend if you want download link
        });
      } catch (error) {
        console.error('Error parsing GitHub release:', error);
        res.status(500).json({ error: 'Failed to parse latest release' });
      }
    });
  }).on('error', (error) => {
    console.error('Error fetching GitHub release:', error);
    res.status(500).json({ error: 'Failed to fetch latest release from GitHub' });
  });
});

router.get('/reinstall', (req, res) => {
  res.send('Reinstall started');
  
  // Execute your existing reinstall script
  exec('npm run update', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing reinstall: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`Reinstall output: ${stdout}`);
  });
});

module.exports = router;
