const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const files = [
  'panel/views/admin/plugins/studio.ejs',
  'panel/views/admin/plugins/editor.ejs'
];

let hasError = false;

files.forEach(file => {
  const template = fs.readFileSync(file, 'utf8');
  try {
    ejs.compile(template);
    console.log(`PASS: ${file} compiled successfully.`);
  } catch (err) {
    console.error(`FAIL: ${file} failed to compile.`);
    console.error(err.message);
    hasError = true;
  }
});

if (hasError) {
  process.exit(1);
} else {
  console.log('All EJS templates verified successfully.');
}
