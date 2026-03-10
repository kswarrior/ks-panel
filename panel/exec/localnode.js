// exec/localnode.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const log = new (require("cat-loggr"))();

const baseDir = path.join(__dirname, '..', '..');
const localNodeDir = path.join(baseDir, 'database', 'localnode');
const pidFile = path.join(baseDir, 'database', 'localnode.pid');

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

  // Parse --panel and --key from the pasted command string (e.g. "npm run configure -- --panel https://... --key 70c0...")
  const panelMatch = config.match(/--panel\s+([^\s]+)/i);
  const keyMatch = config.match(/--key\s+([^\s]+)/i);

  const panelUrl = panelMatch ? panelMatch[1].trim() : null;
  const configureKey = keyMatch ? keyMatch[1].trim() : null;

  if (!panelUrl || !configureKey) {
    return { output: 'Invalid configure command. Must contain --panel URL and --key value.\n', code: 1 };
  }

  await exports.stop();

  const configPath = path.join(localNodeDir, 'config.json');
  let nodeConfig;

  try {
    nodeConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    return { output: `Failed to read config.json: ${err.message}\n`, code: 1 };
  }

  // IMPORTANT FIX:
  // The original wings configure.js tries to POST to /nodes/configure (which returns 404 on this panel).
  // For local-node we manually apply the config using the provided configureKey as the permanent access key
  // (the panel stores this exact key when you created the node, so we keep it instead of generating a new one).
  nodeConfig.remote = panelUrl;
  nodeConfig.key = configureKey;

  try {
    fs.writeFileSync(configPath, JSON.stringify(nodeConfig, null, 2));
  } catch (err) {
    return { output: `Failed to write config.json: ${err.message}\n`, code: 1 };
  }

  return {
    output: `Local node configured successfully!\n` +
            `Panel: ${panelUrl}\n` +
            `Access Key: ${configureKey}\n` +
            `You can now start the node.\n`,
    code: 0
  };
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
