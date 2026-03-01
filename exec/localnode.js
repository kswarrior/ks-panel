// exec/localnode.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const log = new (require("cat-loggr"))();

const rootDir = process.cwd();
const localNodeDir = path.join(rootDir, 'localnode');
const pidFile = path.join(rootDir, 'localnode.pid');

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

function collectOutput(child, callback) {
  let output = '';
  child.stdout.on('data', (data) => { output += data.toString(); });
  child.stderr.on('data', (data) => { output += data.toString(); });
  child.on('close', (code) => {
    callback(output, code);
  });
  child.on('error', (err) => {
    callback(`Error: ${err.message}\n`, 1);
  });
}

exports.install = async (config) => {
  return new Promise((resolve) => {
    let cmd = '';
    if (fs.existsSync(localNodeDir)) {
      cmd = `npm install && npm run configure -- ${config}`;
      const child = spawn(cmd, { shell: true, cwd: localNodeDir });
      collectOutput(child, (output, code) => {
        resolve({ output, code });
      });
    } else {
      cmd = `git clone https://github.com/kswarrior/ks-wings localnode && cd localnode && npm install && npm run configure -- ${config}`;
      const child = spawn(cmd, { shell: true, cwd: rootDir });
      collectOutput(child, (output, code) => {
        resolve({ output, code });
      });
    }
  });
};

exports.start = async () => {
  return new Promise((resolve) => {
    if (!fs.existsSync(localNodeDir)) {
      return resolve({ output: 'Local node not installed.\n', code: 1 });
    }
    if (fs.existsSync(pidFile)) {
      const pid = parseInt(fs.readFileSync(pidFile, 'utf8'));
      if (isProcessRunning(pid)) {
        return resolve({ output: 'Local node already running.\n', code: 0 });
      } else {
        fs.unlinkSync(pidFile);
      }
    }
    const child = spawn('npm', ['start'], { 
      cwd: localNodeDir, 
      detached: true, 
      stdio: 'ignore' 
    });
    child.unref();
    fs.writeFileSync(pidFile, child.pid.toString());
    resolve({ output: `Started local node with PID ${child.pid}\n`, code: 0 });
  });
};

exports.stop = async () => {
  return new Promise((resolve) => {
    if (!fs.existsSync(pidFile)) {
      return resolve({ output: 'No running local node.\n', code: 1 });
    }
    const pid = parseInt(fs.readFileSync(pidFile, 'utf8'));
    if (!isProcessRunning(pid)) {
      fs.unlinkSync(pidFile);
      return resolve({ output: 'PID file existed but process not running. Cleaned up.\n', code: 0 });
    }
    process.kill(pid);
    fs.unlinkSync(pidFile);
    resolve({ output: `Stopped local node (PID ${pid})\n`, code: 0 });
  });
};

exports.restart = async () => {
  const stopRes = await exports.stop();
  if (stopRes.code !== 0 && stopRes.output !== 'No running local node.\n') {
    return stopRes;
  }
  return exports.start();
};
