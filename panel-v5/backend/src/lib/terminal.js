const os = require("os");
const pty = require("node-pty");

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

function createTerminal(ws) {
  const term = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env,
  });

  term.onData((data) => {
    if (ws.readyState === 1) ws.send(data);
  });

  ws.on("message", (msg) => {
    term.write(msg);
  });

  ws.on("close", () => {
    term.kill();
  });
}

module.exports = { createTerminal };
