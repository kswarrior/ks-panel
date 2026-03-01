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
    // Clean up old PID if exists
    if (fs.existsSync(pidFile)) fs.unlinkSync(pidFile);
    return runCommand('npm install');
  } else {
    // Full clone + install
    return runCommand('git clone https://github.com/kswarrior/ks-wings localnode && cd localnode && npm install', rootDir);
  }
};

exports.configure = async (config) => {
  if (!fs.existsSync(localNodeDir)) {
    return { output: 'Local node not installed. Please install first.\n', code: 1 };
  }
  // Stop if running before configure
  await exports.stop();
  const args = config ? ['run', 'configure', '--', ...config.trim().split(/\s+/)] : ['run', 'configure'];
  return runCommand(`npm ${args.join(' ')}`);
};

exports.start = async () => {
  if (!fs.existsSync(localNodeDir)) {
    return { output: 'Local node not installed.\n', code: 1 };
  }
  // Clean up old PID
  if (fs.existsSync(pidFile)) {
    const oldPid = parseInt(fs.readFileSync(pidFile, 'utf8'));
    if (isProcessRunning(oldPid)) {
      return { output: 'Local node already running (PID ' + oldPid + '). Use stop first.\n', code: 1 };
    } else {
      fs.unlinkSync(pidFile);
    }
  }
  return new Promise((resolve) => {
    const child = spawn('npm', ['run', 'start'], { 
      cwd: localNodeDir, 
      detached: true, 
      stdio: 'ignore' 
    });
    child.unref(); // Allow main process to exit
    fs.writeFileSync(pidFile, child.pid.toString());
    resolve({ output: `Started local node with PID ${child.pid}. Check logs in localnode/logs or console.\n`, code: 0 });
  });
};

exports.stop = async () => {
  if (!fs.existsSync(pidFile)) {
    return { output: 'No running local node (no PID file).\n', code: 1 };
  }
  const pid = parseInt(fs.readFileSync(pidFile, 'utf8'));
  if (!isProcessRunning(pid)) {
    fs.unlinkSync(pidFile);
    return { output: 'PID file existed but process not running. Cleaned up.\n', code: 0 };
  }
  try {
    process.kill(pid, 'SIGTERM'); // Graceful stop
    setTimeout(() => {
      if (isProcessRunning(pid)) {
        process.kill(pid, 'SIGKILL'); // Force kill if still running
      }
      fs.unlinkSync(pidFile);
      resolve({ output: `Stopped local node (PID ${pid}) with SIGTERM (fallback to SIGKILL if needed).\n`, code: 0 });
    }, 5000); // Wait 5s for graceful shutdown
    return { output: `Sent stop signal to PID ${pid}. Waiting for graceful shutdown...\n`, code: 0 };
  } catch (err) {
    fs.unlinkSync(pidFile);
    return { output: `Failed to stop PID ${pid}: ${err.message}\n`, code: 1 };
  }
};

exports.restart = async () => {
  const stopRes = await exports.stop();
  if (stopRes.code !== 0) {
    return { output: stopRes.output + ' Aborting restart.\n', code: 1 };
  }
  return exports.start();
};
