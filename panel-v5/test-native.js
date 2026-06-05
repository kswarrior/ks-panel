const path = require('path');
try {
  const native = require(path.join(__dirname, 'backend/src/ks-panel-native.node'));
  console.log('DISK_INFO:', native.getDiskInfo());
  console.log('SCAN:', native.scanHeavyDuty());
  process.exit(0);
} catch (e) {
  console.error('FAILED TO LOAD NATIVE:', e.message);
  process.exit(1);
}
