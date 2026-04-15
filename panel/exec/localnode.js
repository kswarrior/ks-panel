// exec/localnode.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const log = new (require("cat-loggr"))();

const baseDir = path.join(__dirname, '..', '..');
const localNodeDir = path.join(baseDir, 'wings');

// We keep pidFile path for backward compatibility / manual checks, but we no longer rely on it for PM2 operations
const pidFile = path.join(baseDir, 'database', 'localnode.pid');

function runCommand(cmd, options = {}) {
  const defaultOpts = {
    cwd: localNodeDir,
    shell: true,
  };

  const finalOpts = { ...defaultOpts, ...options };

  return new Promise((resolve) => {
    let output = '';
    const child = spawn(cmd, finalOpts);

    child.stdout.on('data', (data) => {
      output += data.toString();
      // Optional: live output during long operations
      // process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      output += data.toString();
      // process.stderr.write(data);
    });

    child.on('close', (code) => {
      resolve({ output, code: code ?? 1 });
    });

    child.on('error', (err) => {
      resolve({ output: `Spawn error: ${err.message}\n`, code: 1 });
    });
  });
}

exports.install = async () => {
  if (fs.existsSync(localNodeDir)) {
    // already exists → just update dependencies
    log.info('Local node directory exists → running npm install');
    return runCommand('npm install --prefer-offline --no-audit --no-fund');
  }

  log.info('Cloning ks-wings repository into wings folder...');

  const cloneCmd = 'git clone https://github.com/kswarrior/ks-wings wings && cd wings && npm install --prefer-offline --no-audit --no-fund';
  return runCommand(cloneCmd, { cwd: baseDir });
};

exports.configure = async (config) => {
  if (!fs.existsSync(localNodeDir)) {
    return { output: 'Local node not installed. Please install first.\n', code: 1 };
  }

  // Stop before re-configuring (good practice)
  await exports.stop();

  if (!config || !config.trim()) {
    return { output: 'No configuration command provided.\n', code: 1 };
  }

  log.info(`Running configure command: ${config}`);

  // Usually something like: node configure.js --panel https://... --key ...
  // or: npm run configure -- --panel ... --key ...
  return runCommand(config.trim());
};

exports.start = async () => {
  if (!fs.existsSync(localNodeDir)) {
    return { output: 'Local node directory not found. Please install first.\n', code: 1 };
  }

  // We use PM2 name "localnode" consistently
  const startCmd = 'npx pm2 start npm --name localnode -- start';

  const result = await runCommand(startCmd);

  if (result.code === 0) {
    // Optional: save PM2 process list (survive reboot if pm2 startup is set)
    await runCommand('npx pm2 save').catch(() => {});
    return {
      output: result.output + '\nLocal node started via PM2 (name: localnode)\n',
      code: 0
    };
  }

  return {
    output: result.output + '\nFailed to start via PM2.\n',
    code: result.code
  };
};

exports.stop = async () => {
  const result = await runCommand('npx pm2 stop localnode || echo "Process not found or already stopped"');

  // Also try to clean up old pid file if it exists
  if (fs.existsSync(pidFile)) {
    fs.unlinkSync(pidFile);
  }

  return {
    output: result.output.trim() || 'Stop command executed.\n',
    code: result.code
  };
};

exports.restart = async () => {
  const result = await runCommand('npx pm2 restart localnode || echo "Process not found"');

  if (result.code === 0) {
    return {
      output: result.output + '\nRestarted via PM2 (name: localnode)\n',
      code: 0
    };
  }

  return {
    output: result.output + '\nRestart may have failed.\n',
    code: result.code
  };
};

exports.reinstall = async () => {
  log.info('Reinstall requested → stopping + removing + reinstalling');

  await exports.stop();

  if (fs.existsSync(localNodeDir)) {
    try {
      fs.rmSync(localNodeDir, { recursive: true, force: true });
      log.info('Removed localnode directory');
    } catch (err) {
      log.error('Failed to remove directory:', err);
    }
  }

  // Also clean PM2 process entry
  await runCommand('npx pm2 delete localnode || true').catch(() => {});

  return exports.install();
};

exports.logs = async () => {
  if (!fs.existsSync(localNodeDir)) {
    return { output: 'Local node not installed.\n', code: 1 };
  }

  // Get last 300 lines (more generous than 100), raw format
  const logsCmd = 'npx pm2 logs localnode --lines 300 --raw || echo "No logs available (process may never have started)"';

  const result = await runCommand(logsCmd);

  let output = `PM2 logs for process "localnode" (last 300 lines):\n\n`;
  output += result.output;

  if (result.code !== 0) {
    output += `\n\nNote: command exited with code ${result.code} — process may not be running.\n`;
  }

  return { output, code: result.code };
};
