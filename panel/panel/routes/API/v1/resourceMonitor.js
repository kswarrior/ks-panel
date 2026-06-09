// resourceMonitor.js remains the same as previously provided
const express = require('express');
const router = express.Router();
const os = require('os');
const fsPromises = require('fs/promises');
const fs = require('fs');

let lastNetStats = { rx: 0, tx: 0, time: Date.now() };

function getNetworkStats() {
  try {
    const data = fs.readFileSync('/proc/net/dev', 'utf8');
    const lines = data.split('\n');
    let rx = 0, tx = 0;
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length > 10 && parts[0].includes(':') && !parts[0].startsWith('lo:')) {
        rx += parseInt(parts[1]);
        tx += parseInt(parts[9]);
      }
    });
    return { rx, tx };
  } catch (e) {
    return { rx: 0, tx: 0 };
  }
}

async function getCpuUsage() {
  function getCpuTimes() {
    return os.cpus().reduce((acc, cpu) => {
      acc.user += cpu.times.user;
      acc.nice += cpu.times.nice;
      acc.sys += cpu.times.sys;
      acc.idle += cpu.times.idle;
      acc.irq += cpu.times.irq;
      return acc;
    }, { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 });
  }

  const start = getCpuTimes();
  await new Promise(resolve => setTimeout(resolve, 500));
  const end = getCpuTimes();

  const idleDiff = end.idle - start.idle;
  const totalDiff = (end.user + end.nice + end.sys + end.idle + end.irq) -
                   (start.user + start.nice + start.sys + start.idle + start.irq);

  return 100 - (idleDiff / totalDiff * 100);
}

router.get('/resourceMonitor', async (req, res) => {
  const totalRam = os.totalmem() / (1024 ** 3); // GB
  const freeRam = os.freemem() / (1024 ** 3);
  const usedRam = totalRam - freeRam;
  const ramPercent = (usedRam / totalRam) * 100;

  const cpuPercent = await getCpuUsage();
  const cpuCores = os.cpus().length;

  const currentNet = getNetworkStats();
  const now = Date.now();
  const timeDiff = (now - lastNetStats.time) / 1000;
  const rxSpeed = (currentNet.rx - lastNetStats.rx) / timeDiff; // bytes/s
  const txSpeed = (currentNet.tx - lastNetStats.tx) / timeDiff;

  lastNetStats = { ...currentNet, time: now };

  let disk = { used: 0, total: 0, percent: 0 };
  try {
    const stats = await fsPromises.statfs('/');
    const totalDisk = (stats.blocks * stats.bsize) / (1024 ** 3); // GB
    const freeDisk = (stats.bfree * stats.bsize) / (1024 ** 3);
    const usedDisk = totalDisk - freeDisk;
    disk = { used: usedDisk, total: totalDisk, percent: (usedDisk / totalDisk) * 100 };
  } catch (error) {
    console.error('Error getting disk usage:', error);
  }

  res.status(200).json({
    ram: { used: usedRam, total: totalRam, percent: ramPercent },
    cpu: { percent: cpuPercent, cores: cpuCores },
    disk: { used: disk.used, total: disk.total, percent: disk.percent },
    network: { rx: rxSpeed, tx: txSpeed },
    uptime: os.uptime(),
    load: os.loadavg()
  });
});

module.exports = router;
