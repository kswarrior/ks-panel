const Keyv = require('keyv');
const oldDb = new Keyv('sqlite://storage/kspanel.db');  // Or hardcoded path
const fs = require('fs');

async function exportData() {
  const allData = {};  // Keyv doesn't list keys; query SQL if needed
  // For simple: await oldDb.get('images'); allData.images = ... (manual for known keys like 'images', 'settings')
  fs.writeFileSync('migrate.json', JSON.stringify(allData, null, 2));
}
exportData();
