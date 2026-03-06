// resourceMonitor.js remains the same as previously provided
const express = require('express');
const router = express.Router();
const os = require('os');
const fsPromises = require('fs/promises');

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
    cpu: { percent: cpuPercent },
    disk: { used: disk.used, total: disk.total, percent: disk.percent }
  });
});

module.exports = router;
