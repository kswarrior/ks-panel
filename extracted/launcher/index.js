const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const panelDir = path.join(__dirname, "../Panel");
const panelFile = path.join(panelDir, "index.js"); // FIXED

let panelProcess = null;

// Stylish Launcher Header
console.clear();
console.log("=====================================");
console.log("        🚀 KS PANEL LAUNCHER");
console.log("=====================================\n");

// Function to start panel
function startPanel() {
  if (!fs.existsSync(panelFile)) {
    console.log("[KS Panel] index.js not found...");
    return;
  }

  console.log("[KS Panel] Starting panel...\n");

  panelProcess = spawn("node", [panelFile], {
    cwd: panelDir,
    stdio: "inherit",
    env: process.env
  });

  panelProcess.on("close", (code) => {
    console.log(`\n[KS Panel] Panel exited with code ${code}`);
    panelProcess = null; // allow restart
  });

  panelProcess.on("error", (err) => {
    console.error("[KS Panel] Failed to start panel:", err);
  });
}

// Check every 5 seconds if panel exists
function watchPanel() {
  if (panelProcess) return;

  if (fs.existsSync(panelFile)) {
    startPanel();
  } else {
    console.log("[KS Panel] Waiting for Panel/index.js...");
  }
}

// Run immediately
watchPanel();

// Then check every 5 seconds
setInterval(watchPanel, 5000);
