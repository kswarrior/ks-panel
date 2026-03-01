const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");

const { isAdmin } = require("../../utils/isAdmin.js");
const log = new (require("cat-loggr"))();

router.get("/admin/localnode", isAdmin, async (req, res) => {
  try {
    res.render("admin/localnode", {
      req,
      user: req.user,
      // You can pass more variables if needed (theme, translations, etc.)
    });
  } catch (err) {
    log.error("Error rendering localnode page:", err);
    res.status(500).render("error", { message: "Failed to load local node setup" });
  }
});

router.post("/admin/localnode", isAdmin, async (req, res) => {
  let output = "Starting local Wings installation...\n\n";

  // You can use req.body.configuration if you want to pass flags/options
  // For now we ignore it and just run the script
  // If you want to support custom flags later → const args = ['run', 'local:node', '--', ...someArgs];

  const child = spawn("npm", ["run", "local:node"], {
    cwd: process.cwd(),          // run in project root
    shell: true,                 // safer on Windows + allows npm command
    env: { ...process.env },     // inherit environment
  });

  child.stdout.on("data", (data) => {
    output += data.toString();
  });

  child.stderr.on("data", (data) => {
    output += data.toString();   // merge stderr into same log
  });

  child.on("error", (error) => {
    output += `\n[ERROR] Failed to start process: ${error.message}\n`;
    res.status(500).json({ log: output });
  });

  child.on("close", (code) => {
    output += `\n───────────────────────────────────────\n`;
    output += `Process finished with exit code ${code}\n`;
    if (code === 0) {
      output += "Installation appears to have completed successfully.\n";
    } else {
      output += "Installation may have failed — check the log above.\n";
    }
    res.json({ log: output });
  });
});

module.exports = router;
