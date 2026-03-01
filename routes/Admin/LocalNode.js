// routes/Admin/LocalNode.js
const express = require("express");
const router = express.Router();

const { isAdmin } = require("../../utils/isAdmin.js");
const log = new (require("cat-loggr"))();
const localNodeExec = require('../../exec/localnode');

router.get("/admin/localnode", isAdmin, async (req, res) => {
  try {
    res.render("admin/localnode", {
      req,
      user: req.user,
    });
  } catch (err) {
    log.error("Error rendering localnode page:", err);
    res.status(500).render("error", { message: "Failed to load local node setup" });
  }
});

router.post("/admin/localnode/install", isAdmin, async (req, res) => {
  const config = req.body.configuration || '';
  try {
    const { output, code } = await localNodeExec.install(config);
    let finalOutput = output;
    finalOutput += `\n───────────────────────────────────────\nProcess finished with exit code ${code}\n`;
    if (code === 0) {
      finalOutput += "Installation completed successfully.\n";
    } else {
      finalOutput += "Installation may have failed — check the log.\n";
    }
    res.json({ log: finalOutput });
  } catch (err) {
    res.status(500).json({ log: `Error during installation: ${err.message}\n` });
  }
});

router.post("/admin/localnode/start", isAdmin, async (req, res) => {
  try {
    const { output, code } = await localNodeExec.start();
    res.json({ log: output });
  } catch (err) {
    res.status(500).json({ log: `Error starting: ${err.message}\n` });
  }
});

router.post("/admin/localnode/stop", isAdmin, async (req, res) => {
  try {
    const { output, code } = await localNodeExec.stop();
    res.json({ log: output });
  } catch (err) {
    res.status(500).json({ log: `Error stopping: ${err.message}\n` });
  }
});

router.post("/admin/localnode/restart", isAdmin, async (req, res) => {
  try {
    const { output, code } = await localNodeExec.restart();
    res.json({ log: output });
  } catch (err) {
    res.status(500).json({ log: `Error restarting: ${err.message}\n` });
  }
});

module.exports = router;
