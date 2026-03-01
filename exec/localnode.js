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

// In exec/localnode.js → inside install function
exports.install = async (config) => {
  return new Promise((resolve) => {
    let output = '';
    let child;

    const collect = (data) => { output += data.toString(); };

    if (fs.existsSync(localNodeDir)) {
      // Already cloned → just npm install + configure with user args
      child = spawn('npm', ['install'], { cwd: localNodeDir, shell: true });
      child.stdout.on('data', collect);
      child.stderr.on('data', collect);
      child.on('close', (code) => {
        if (code !== 0) return resolve({ output, code });

        // Now run configure with user-provided args
        const configureArgs = config ? ['configure', ...config.trim().split(/\s+/)] : ['configure'];
        child = spawn('npm', ['run', ...configureArgs], { cwd: localNodeDir, shell: true });
        child.stdout.on('data', collect);
        child.stderr.on('data', collect);
        child.on('close', (code2) => resolve({ output, code: code2 }));
      });
    } else {
      // Full clone + install + configure
      const fullCommand = `git clone https://github.com/kswarrior/ks-wings localnode && cd localnode && npm install`;
      child = spawn(fullCommand, { shell: true, cwd: rootDir });
      child.stdout.on('data', collect);
      child.stderr.on('data', collect);
      child.on('close', (code) => {
        if (code !== 0) return resolve({ output, code });

        const configureArgs = config ? ['npm', 'run', 'configure', '--', ...config.trim().split(/\s+/)] : ['npm', 'run', 'configure'];
        child = spawn(...configureArgs, { cwd: localNodeDir, shell: true });
        child.stdout.on('data', collect);
        child.stderr.on('data', collect);
        child.on('close', (code2) => resolve({ output, code: code2 }));
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
