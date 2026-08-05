const express = require("express");
const router = express.Router();
const { db } = require("../../handlers/db.js");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const log = new (require("cat-loggr"))();

const TEMPLATES_DIR = path.join(__dirname, "../../../database/templates");

router.get("/dashboard/create", async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const [billing, nodes, userInstances, images] = await Promise.all([
    db.get("billing_settings") || { enabled: false },
    db.get("nodes") || [],
    db.get(`${req.user.userId}_instances`) || [],
    db.get("images") || []
  ]);

  if (billing.enabled && userInstances.length >= (billing.defaultSlots || 1)) {
    return res.render("errors/error", {
      req, user: req.user,
      error: "Slot limit reached. Please delete an instance or upgrade your plan."
    });
  }

  // Filter only online nodes
  const nodeObjs = await Promise.all(nodes.map(id => db.get(`${id}_node`)));
  const onlineNodes = nodeObjs.filter(n => n && n.status === "Online");

  let templates = [];
  if (fs.existsSync(TEMPLATES_DIR)) {
    const dirs = fs.readdirSync(TEMPLATES_DIR).filter(f => fs.statSync(path.join(TEMPLATES_DIR, f)).isDirectory());
    templates = dirs.map(dir => {
      const mainPath = path.join(TEMPLATES_DIR, dir, "main.json");
      try {
        const content = JSON.parse(fs.readFileSync(mainPath, "utf8"));
        return { filename: dir, name: content.meta?.display_name || dir };
      } catch (e) { return null; }
    }).filter(Boolean);
  }

  res.render("dashboard/create", {
    req,
    user: req.user,
    billing,
    nodes: onlineNodes,
    templates,
    slotsLeft: (billing.defaultSlots || 0) - userInstances.length
  });
});

router.post("/dashboard/create", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const { name, template: templateFile, nodeId } = req.body;
  const billing = await db.get("billing_settings") || { enabled: false };
  const userInstances = await db.get(`${req.user.userId}_instances`) || [];

  if (billing.enabled && userInstances.length >= (billing.defaultSlots || 1)) {
    return res.status(400).json({ error: "No slots available." });
  }

  try {
    const node = await db.get(`${nodeId}_node`);
    if (!node || node.status !== "Online") throw new Error("Node unavailable");

    const templatePath = path.join(TEMPLATES_DIR, templateFile, "main.json");
    const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));

    // Find first available allocation on the node
    const allocations = await db.get(`${nodeId}_allocations`) || [];
    const alloc = allocations.find(a => !a.assignedTo);
    if (!alloc) throw new Error("No available ports on this node.");

    const Id = uuidv4().split("-")[0];

    // Use billing defaults or template defaults
    const memory = billing.enabled ? (billing.defaultRam || 1024) : 1024;
    const cpu = billing.enabled ? (billing.defaultCpu || 100) : 100;
    const disk = billing.enabled ? (billing.defaultDisk || 5120) : 5120;

    const wingsPayload = {
      Id, Name: name, InstanceType: 'docker',
      Image: template.environment?.docker_image || "ghcr.io/parkervcp/yolks:debian",
      Memory: memory, Cpu: cpu, Disk: disk,
      ExposedPorts: { [`${alloc.port}/tcp`]: {} },
      PortBindings: { [`${alloc.port}/tcp`]: [{ HostIp: alloc.ip, HostPort: alloc.port }] },
      Env: [`PRIMARY_PORT=${alloc.port}`]
    };

    await axios.post(`http://${node.address}:${node.port}/instances/create`, wingsPayload, {
      auth: { username: "kspanel", password: node.apiKey },
      timeout: 30000
    });

    const instanceData = {
      Name: name, Id, Node: node, User: req.user.userId,
      InternalState: "STOPPED", ContainerId: Id, VolumeId: Id,
      Memory: memory, Cpu: cpu, Disk: disk,
      Allocation: { IP: alloc.ip, Port: alloc.port },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    alloc.assignedTo = Id;
    await db.set(`${nodeId}_allocations`, allocations);

    userInstances.push(instanceData);
    await db.set(`${req.user.userId}_instances`, userInstances);

    const globalInstances = await db.get("instances") || [];
    globalInstances.push(instanceData);
    await db.set("instances", globalInstances);

    await db.set(`${Id}_instance`, instanceData);

    res.json({ success: true, id: Id });
  } catch (err) {
    log.error("Deployment failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
