// routes/Admin/LocalNode.js
const express = require("express");
const router = express.Router();

const { isAdmin, hasPermission } = require("../../utils/isAdmin.js");
const log = new (require("cat-loggr"))();
const localNodeExec = require('../../exec/localnode');

router.get("/admin/nodes/localnode", hasPermission('manage_nodes'), async (req, res) => {
  try {
    const nodeIds = await db.get("nodes") || [];
    const nodes = await Promise.all(nodeIds.map(id => db.get(`${id}_node`)));
    res.render("admin/nodes/localnode", {
      req,
      user: req.user,
      nodes: nodes.filter(Boolean)
    });
  } catch (err) {
    log.error("Error rendering localnode page:", err);
    res.status(500).render("error", { message: "Failed to load local node setup" });
  }
});

router.post("/admin/nodes/localnode/install", hasPermission('manage_nodes'), async (req, res) => {
  try {
    const { output, code } = await localNodeExec.install();
    let finalOutput = output;
    finalOutput += `\n───────────────────────────────────────\nProcess finished with exit code ${code}\n`;
    if (code === 0) {
      finalOutput += "Installation completed successfully. Now run 'Import Configure' with your panel URL and key.\n";
    } else {
      finalOutput += "Installation may have failed — check the log.\n";
    }
    res.json({ log: finalOutput });
  } catch (err) {
    res.status(500).json({ log: `Error during installation: ${err.message}\n` });
  }
});

router.post("/admin/nodes/localnode/configure", hasPermission('manage_nodes'), async (req, res) => {
  const config = req.body.configuration || '';
  try {
    const { output, code } = await localNodeExec.configure(config);
    let finalOutput = output;
    finalOutput += `\n───────────────────────────────────────\nProcess finished with exit code ${code}\n`;
    if (code === 0) {
      finalOutput += "Configuration completed successfully. You can now start the node.\n";
    } else {
      finalOutput += "Configuration may have failed — check the log (ensure --panel and --key are provided).\n";
    }
    res.json({ log: finalOutput });
  } catch (err) {
    res.status(500).json({ log: `Error during configuration: ${err.message}\n` });
  }
});

router.post("/admin/nodes/localnode/start", hasPermission('manage_nodes'), async (req, res) => {
  try {
    const { output, code } = await localNodeExec.start();
    res.json({ log: output + `\nExit code: ${code}` });
  } catch (err) {
    res.status(500).json({ log: `Error starting: ${err.message}\n` });
  }
});

router.post("/admin/nodes/localnode/stop", hasPermission('manage_nodes'), async (req, res) => {
  try {
    const { output, code } = await localNodeExec.stop();
    res.json({ log: output + `\nExit code: ${code}` });
  } catch (err) {
    res.status(500).json({ log: `Error stopping: ${err.message}\n` });
  }
});

router.post("/admin/nodes/localnode/restart", hasPermission('manage_nodes'), async (req, res) => {
  try {
    const { output, code } = await localNodeExec.restart();
    res.json({ log: output + `\nExit code: ${code}` });
  } catch (err) {
    res.status(500).json({ log: `Error restarting: ${err.message}\n` });
  }
});

router.post("/admin/nodes/localnode/reinstall", hasPermission('manage_nodes'), async (req, res) => {
  try {
    const { output, code } = await localNodeExec.reinstall();
    let finalOutput = output;
    finalOutput += `\n───────────────────────────────────────\nProcess finished with exit code ${code}\n`;
    if (code === 0) {
      finalOutput += "Reinstallation completed successfully. You can now configure and start the node.\n";
    } else {
      finalOutput += "Reinstallation may have failed — check the log.\n";
    }
    res.json({ log: finalOutput });
  } catch (err) {
    res.status(500).json({ log: `Error during reinstallation: ${err.message}\n` });
  }
});

router.post("/admin/nodes/localnode/logs", hasPermission('manage_nodes'), async (req, res) => {
  try {
    const { output, code } = await localNodeExec.logs();
    let finalOutput = output;
    finalOutput += `\n───────────────────────────────────────\nProcess finished with exit code ${code}\n`;
    if (code === 0) {
      finalOutput += "PM2 logs retrieved successfully.\n";
    } else {
      finalOutput += "No PM2 logs found or error occurred.\n";
    }
    res.json({ log: finalOutput });
  } catch (err) {
    res.status(500).json({ log: `Error retrieving logs: ${err.message}\n` });
  }
});

module.exports = router;
