// exec/localnode.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const log = new (require("cat-loggr"))();

const rootDir = process.cwd();
const localNodeDir = path.join(rootDir, 'localnode');

function runCommand(command, cwd = localNodeDir, shell = true) {
  return new Promise((resolve) => {
    let output = '';
    const child = spawn(command, { cwd, shell });
    child.stdout.on('data', (data) => { output += data.toString(); });
    child.stderr.on('data', (data) => { output += data.toString(); });
    child.on('close', (code) => resolve({ output, code }));
    child.on('error', (err) => resolve({ output: `Error: ${err.message}\n`, code: 1 }));
  });
}

exports.install = async () => {
  if (fs.existsSync(localNodeDir)) {
    return runCommand('npm install && npm install pm2');
  } else {
    return runCommand('git clone https://github.com/kswarrior/ks-wings localnode && cd localnode && npm install && npm install pm2', rootDir);
  }
};

exports.configure = async (config) => {
  if (!fs.existsSync(localNodeDir)) {
    return { output: 'Local node not installed. Please install first.\n', code: 1 };
  }
  const args = config ? ['run', 'configure', '--', ...config.trim().split(/\s+/)] : ['run', 'configure'];
  return runCommand(`npm ${args.join(' ')}`);
};

exports.start = async () => {
  if (!fs.existsSync(localNodeDir)) {
    return { output: 'Local node not installed.\n', code: 1 };
  }
  return runCommand('npx pm2 start npm --name "ks-wings" -- run start');
};

exports.stop = async () => {
  return runCommand('npx pm2 stop ks-wings', localNodeDir);
};

exports.restart = async () => {
  return runCommand('npx pm2 restart ks-wings', localNodeDir);
};
