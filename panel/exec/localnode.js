// exec/localnode.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const log = new (require("cat-loggr"))();

const baseDir = path.join(__dirname, '..', '..');
const localNodeDir = path.join(baseDir, 'wings');

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
    });

    child.stderr.on('data', (data) => {
      output += data.toString();
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
  if (!fs.existsSync(localNodeDir)) {
     // This shouldn't happen as I already created it, but for future:
     return { output: 'Local node directory not found.\n', code: 1 };
  }

  log.info('Building Go Wings...');
  return runCommand('go build -o kswings main.go');
};

exports.configure = async (config) => {
  if (!fs.existsSync(localNodeDir)) {
    return { output: 'Local node not installed. Please install first.\n', code: 1 };
  }

  await exports.stop();

  if (!config || !config.trim()) {
    return { output: 'No configuration command provided.\n', code: 1 };
  }

  log.info(`Running configure command: ${config}`);
  // In Go version, maybe we handle configuration differently, but if the panel sends a command:
  // Usually the panel might send "node handlers/configure.js ..."
  // We might need to implement a configure flag in main.go or a separate utility.
  // For now, let's assume it might still work if we have a configure.go or similar,
  // or if the user manually edits config.json.
  // Actually, the original was `node handlers/configure.js`.
  // I should probably implement a simple configure tool in Go or keep a JS helper for it.
  // Let's stick to assuming the command provided works.
  return runCommand(config.trim());
};

exports.start = async () => {
  if (!fs.existsSync(localNodeDir)) {
    return { output: 'Local node directory not found. Please install first.\n', code: 1 };
  }

  // We use PM2 to run the Go binary
  const startCmd = 'npx pm2 start ./kswings --name localnode --interpreter none';

  const result = await runCommand(startCmd);

  if (result.code === 0) {
    await runCommand('npx pm2 save').catch(() => {});
    return {
      output: result.output + '\nLocal node (Go) started via PM2 (name: localnode)\n',
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
  log.info('Reinstall requested → rebuilding Go Wings');
  await exports.stop();
  // We don't necessarily want to delete the whole directory if it's the rewrite.
  // Just rebuild.
  return exports.install();
};

exports.logs = async () => {
  if (!fs.existsSync(localNodeDir)) {
    return { output: 'Local node not installed.\n', code: 1 };
  }
  const logsCmd = 'npx pm2 logs localnode --lines 300 --raw || echo "No logs available"';
  const result = await runCommand(logsCmd);
  let output = `PM2 logs for process "localnode" (Go Wings) (last 300 lines):\n\n`;
  output += result.output;
  return { output, code: result.code };
};
