// exec/localnode.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const log = new (require("cat-loggr"))();

const baseDir = path.join(__dirname, '..', '..');
const localNodeDir = path.join(baseDir, 'database', 'localnode'); // relative to current file
const pidFile = path.join(baseDir, 'database', 'localnode.pid');   // relative PID

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

function runCommand(command, cwd = localNodeDir, shell = true, liveOutput = false) {
  return new Promise((resolve) => {
    let output = '';
    const child = spawn(command, { cwd, shell });

    if (liveOutput) {
      child.stdout.on('data', (data) => process.stdout.write(data.toString()));
      child.stderr.on('data', (data) => process.stderr.write(data.toString()));
    } else {
      child.stdout.on('data', (data) => { output += data.toString(); });
      child.stderr.on('data', (data) => { output += data.toString(); });
    }

    child.on('close', (code) => resolve({ output, code }));
    child.on('error', (err) => resolve({ output: `Error: ${err.message}\n`, code: 1 }));
  });
}

exports.install = async () => {
  if (fs.existsSync(localNodeDir)) {
    if (fs.existsSync(pidFile)) fs.unlinkSync(pidFile);
    return runCommand('npm install');
  } else {
    fs.mkdirSync(path.join(baseDir, 'database'), { recursive: true });
    return runCommand(
      'git clone https://github.com/kswarrior/ks-wings localnode && cd localnode && npm install',
      path.join(baseDir, 'database')
    );
  }
};

exports.configure = async (config) => {
  if (!fs.existsSync(localNodeDir)) {
    return { output: 'Local node not installed. Please install first.\n', code: 1 };
  }
  await exports.stop();
  const args = config ? config.trim().split(/\s+/) : [];
  return runCommand(args.join(' '));
};

exports.start = async () => {
  if (!fs.existsSync(localNodeDir)) {
    return { output: 'Local node not installed.\n', code: 1 };
  }
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
      stdio: ['ignore', 'pipe', 'pipe']
    });

    child.stdout.on('data', (data) => process.stdout.write(data.toString()));
    child.stderr.on('data', (data) => process.stderr.write(data.toString()));

    child.unref();
    fs.writeFileSync(pidFile, child.pid.toString());
    resolve({ output: `Started local node with PID ${child.pid}. Live logs shown above.\n`, code: 0 });
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
    process.kill(pid, 'SIGTERM');
    setTimeout(() => {
      if (isProcessRunning(pid)) {
        process.kill(pid, 'SIGKILL');
      }
      if (fs.existsSync(pidFile)) fs.unlinkSync(pidFile);
    }, 5000);
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

exports.reinstall = async () => {
  await exports.stop();
  if (fs.existsSync(localNodeDir)) {
    fs.rmSync(localNodeDir, { recursive: true, force: true });
  }
  if (fs.existsSync(pidFile)) {
    fs.unlinkSync(pidFile);
  }
  return exports.install();
};

exports.logs = async () => {
  if (!fs.existsSync(localNodeDir)) {
    return { output: 'Local node not installed.\n', code: 1 };
  }
  const homeDir = os.homedir();
  const pm2LogDir = path.join(homeDir, '.pm2', 'logs');
  const pm2Name = 'localnode';
  const outLogPath = path.join(pm2LogDir, `${pm2Name}-out.log`);
  const errLogPath = path.join(pm2LogDir, `${pm2Name}-error.log`);
  let output = `PM2 Logs for "${pm2Name}":\n\n`;
  let code = 0;
  if (fs.existsSync(outLogPath)) {
    output += '=== STDOUT LOG (last 100 lines) ===\n';
    try {
      const content = fs.readFileSync(outLogPath, 'utf8');
      const lines = content.split('\n').slice(-100).join('\n');
      output += lines + '\n\n';
    } catch (e) {
      output += `Error reading out log: ${e.message}\n`;
    }
  } else {
    output += 'No STDOUT log file found (pm2 may not be used or name mismatch).\n';
    code = 1;
  }
  if (fs.existsSync(errLogPath)) {
    output += '=== STDERR LOG (last 100 lines) ===\n';
    try {
      const content = fs.readFileSync(errLogPath, 'utf8');
      const lines = content.split('\n').slice(-100).join('\n');
      output += lines + '\n';
    } catch (e) {
      output += `Error reading err log: ${e.message}\n`;
    }
  } else {
    output += 'No STDERR log file found.\n';
  }
  if (code === 1 && !fs.existsSync(outLogPath) && !fs.existsSync(errLogPath)) {
    output += '\nTip: If using PM2, ensure the process name is "localnode" or update the code.\n';
  }
  return { output, code };
};
