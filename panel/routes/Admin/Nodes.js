const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const { db } = require("../../handlers/db.js");
const { parsePorts } = require('../../utils/dbHelper.js');
const { logAudit } = require("../../handlers/auditLog.js");
const { isAdmin } = require("../../utils/isAdmin.js");
const { checkNodeStatus, checkMultipleNodesStatus, invalidateNodeCache } = require("../../utils/nodeHelper.js");
const { getPaginatedNodes, invalidateCache } = require("../../utils/dbHelper.js");
const log = new (require("cat-loggr"))();

// ==================== FULLY ENHANCED NODES ROUTES (Pterodactyl + All Extras) ====================

router.get("/admin/nodes/overview", isAdmin, async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 20;

  const nodesResult = await getPaginatedNodes(page, pageSize);
  let nodeIds = nodesResult.data;
  
  let instances = (await db.get("instances")) || [];
  let set = {};
  
  nodeIds.forEach(function (nodeId) {
    set[nodeId] = 0;
    instances.forEach(function (instance) {
      if (instance.Node.id == nodeId) {
        set[nodeId]++;
      }
    });
  });

  let nodes = await checkMultipleNodesStatus(nodeIds);

  // ==================== FETCH NODE HOST RESOURCES (new resourceMonitor) ====================
  const nodesWithResources = await Promise.all(
    nodes.map(async (node) => {
      if (node.status !== "Online") {
        node.resources = null;
        return node;
      }

      try {
        const protocol = node.connectionProtocol === 'https' ? 'https' : 'http';
        const monitorUrl = `${protocol}://${node.address}:${node.port}/resourceMonitor`;

        const response = await axios.get(monitorUrl, { timeout: 4000 });
        node.resources = response.data;

        // Auto-populate RAM/Disk for "auto" mode nodes (same logic as single-node route)
        if (node.resourceMode === 'auto' && node.ram === 0 && response.data?.ram) {
          node.ram = Math.round(parseFloat(response.data.ram.total));
          node.disk = Math.round(parseFloat(response.data.disk.total));
          await db.set(node.id + "_node", node);
          invalidateNodeCache(node.id);
        }
      } catch (error) {
        log.error(`Resource monitor failed for node ${node.id}: ${error.message}`);
        node.resources = null;
      }
      return node;
    })
  );
  
  const locationIds = (await db.get("locations")) || [];
  const locations = [];
  for (const locId of locationIds) {
    const loc = await db.get(locId + "_location");
    if (loc) locations.push(loc);
  }

  res.render("admin/nodes/overview", {
  req,
  user: req.user,
  nodes: nodesWithResources,
  set,
  pagination: nodesResult.pagination,
  locations,
});
});

// ==================== NEW: CREATE NODE PAGE (create.ejs) ====================
router.get("/admin/nodes/create", isAdmin, async (req, res) => {
  const locationIds = (await db.get("locations")) || [];
  const locations = [];
  for (const locId of locationIds) {
    const loc = await db.get(locId + "_location");
    if (loc) locations.push(loc);
  }

  res.render("admin/nodes/create", {
    req,
    user: req.user,
    locations,
  });
});

router.get("/admin/nodes/node/:id/stats", isAdmin, async (req, res) => {
  const { id } = req.params;

  let node = await db.get(id + "_node");
  if (!node) {
    return res.status(404).send("Node not found");
  }
  
  node = await checkNodeStatus(node);

  let instances = (await db.get("instances")) || [];
  let instanceCount = 0;
  instances.forEach(function (instance) {
    if (instance.Node.id == id) {
      instanceCount++;
    }
  });

  let stats = {};
  let status = "Offline";

  try {
    log.debug(`Fetching stats from daemon: http://${node.address}:${node.port}/stats`);
    const response = await axios.get(
      `http://kspanel:${node.apiKey}@${node.address}:${node.port}/stats`,
      { timeout: 5000 }
    );
    stats = response.data;

    if (stats && stats.uptime !== "0d 0h 0m") {
      status = "Online";
    }
  } catch (error) {
    log.error(`Stats fetch failed for node ${id}: ${error.message}`);
    if (error.response) log.debug('Daemon response:', error.response.data);
  }

  let set = { [id]: instanceCount };

  res.render("admin/nodes/stats", {
    req,
    user: req.user,
    stats,
    node,
    set,
    status,
  });
});

// ==================== CREATE NODE - ALL FIELDS (Pterodactyl + FTP + Extras) ====================
router.post("/admin/nodes/create", isAdmin, async (req, res) => {
  const {
    name,
    address,
    port,
    sftpPort,
    ftp,
    location,
    resourceMode,
    ram,
    disk,
    memoryOverallocate = 0,
    diskOverallocate = 0,
    uploadSize = 500,
    behindProxy = false,
    connectionProtocol = "http",
    allocIp,
    allocAlias,
    portsInput
  } = req.body;

  if (!name || !address || !port) {
    return res.status(400).json({ error: "Form validation failure: Name, Address (FQDN/IP), and Port are required." });
  }

  // Handle resourceMode: if auto, set ram/disk to 0 as flag; else use provided values
  let finalRam = 0;
  let finalDisk = 0;
  if (resourceMode === 'manual') {
    if (!ram || !disk) {
      return res.status(400).json({ error: "RAM and Disk are required in Manual mode." });
    }
    finalRam = parseInt(ram);
    finalDisk = parseInt(disk);
  } else if (resourceMode === 'auto') {
    // Auto-detect flag: will be populated later via resource monitor
    finalRam = 0;
    finalDisk = 0;
  } else {
    return res.status(400).json({ error: "Invalid resourceMode: must be 'auto' or 'manual'." });
  }

  const nodeId = uuidv4();
  const configureKey = uuidv4();

  const node = {
    id: nodeId,
    name: name.trim(),
    description: "",
    address: address.trim(),
    port: parseInt(port),
    sftpPort: parseInt(sftpPort || 2022),
    ftp: {
      ip: (ftp && ftp.ip) ? ftp.ip.trim() : "0.0.0.0",
      port: parseInt((ftp && ftp.port) || 3003)
    },
    location: location || null,
    ram: finalRam,
    disk: finalDisk,
    memoryOverallocate: parseInt(memoryOverallocate),
    diskOverallocate: parseInt(diskOverallocate),
    uploadSize: parseInt(uploadSize),
    behindProxy: behindProxy === true || behindProxy === "true",
    connectionProtocol: connectionProtocol,
    resourceMode: resourceMode,
    serverFileDirectory: "/var/lib/kswings/volumes",
    publicIp: address.trim(),
    maintenanceMode: false,
    connectionType: "Direct",
    maxServers: 50,
    healthCheckUrl: "",
    tags: [],
    trustedProxies: behindProxy ? ["127.0.0.1"] : [],
    apiKey: null,
    configureKey,
    status: "Unconfigured",
    createdAt: Date.now()
  };

  try {
    await db.set(`${nodeId}_node`, node);
    const nodes = (await db.get("nodes")) || [];
    nodes.push(nodeId);
    await db.set("nodes", nodes);
    invalidateCache("nodes");

    // Handle initial allocations (your existing logic - unchanged)
    if (portsInput && portsInput.trim()) {
      const ports = parsePorts(portsInput);
      if (ports.length > 0) {
        const allocations = ports.map(p => ({
          id: uuidv4(),
          ip: allocIp?.trim() || address.trim(),
          alias: allocAlias?.trim() || null,
          port: p,
          assignedTo: null,
        }));

        await db.set(`${nodeId}_allocations`, allocations);
      }
    }

    logAudit(req.user.userId, req.user.username, "node:create", req.ip);
    res.status(201).json({ ...node, configureKey });
  } catch (err) {
    log.error("Error creating node:", err);
    res.status(500).json({ error: "Database error during creation." });
  }
});

router.post("/admin/nodes/delete", isAdmin, async (req, res) => {
  const { nodeId } = req.body;
  if (!nodeId) {
    return res.status(400).json({ error: "Missing nodeId" });
  }

  try {
    const nodes = (await db.get("nodes")) || [];
    let foundNode = null;

    for (const id of nodes) {
      const node = await db.get(id + "_node");
      if (node && node.id === nodeId) {
        foundNode = node;
        break;
      }
    }

    if (!foundNode) {
      return res.status(404).json({ error: "Node not found" });
    }

    const node = foundNode;
    let instances = (await db.get("instances")) || [];
    let set = {};

    nodes.forEach(function (id) {
      set[id] = 0;
      instances.forEach(function (instance) {
        if (instance.Node.id === id) {
          set[id]++;
        }
      });
    });

    if (set[node.id] > 0) {
      if (!req.query.deleteinstances || req.query.deleteinstances === "false") {
        return res
          .status(400)
          .json({ error: "There are instances on the node" });
      }

      if (req.query.deleteinstances === "true") {
        let delinstances = instances.filter(function (instance) {
          return instance.Node.id === node.id;
        });

        instances = instances.filter(function (instance) {
          return instance.Node.id !== node.id;
        });

        await db.set("instances", instances);

        for (const instance of delinstances) {
          await db.delete(instance.Id + "_instance");
        }

        for (const instance of delinstances) {
          let userInstances =
            (await db.get(instance.User + "_instances")) || [];
          userInstances = userInstances.filter(
            (inst) => inst.Id !== instance.Id
          );
          await db.set(instance.User + "_instances", userInstances);
        }

        try {
          await axios.get(
            `http://kspanel:${node.apiKey}@${node.address}:${node.port}/instances/purge/all`
          );
        } catch (apiError) {
          log.error("Error calling purge API:", apiError);
        }
      }
    }

    await db.delete(node.id + "_node");
    nodes.splice(nodes.indexOf(node.id), 1);
    await db.set("nodes", nodes);

    invalidateNodeCache(node.id);
    invalidateCache("nodes");

    logAudit(req.user.userId, req.user.username, "node:delete", req.ip);
    res.status(200).json({ success: true });
  } catch (error) {
    log.error("Error deleting node:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/nodes/configure", async (req, res) => {
  const { configureKey, accessKey } = req.query;

  if (!configureKey || !accessKey) {
    return res.status(400).json({ error: "Missing configureKey or accessKey" });
  }

  try {
    const nodes = (await db.get("nodes")) || [];
    let foundNode = null;
    for (const nodeId of nodes) {
      const node = await db.get(nodeId + "_node");
      if (node && node.configureKey === configureKey) {
        foundNode = node;
        break;
      }
    }

    if (!foundNode) {
      return res.status(404).json({ error: "Node not found" });
    }

    foundNode.apiKey = accessKey;
    foundNode.status = "Configured";
    foundNode.configureKey = null;

    await db.set(foundNode.id + "_node", foundNode);
    invalidateNodeCache(foundNode.id);

    res.status(200).json({ message: "Node configured successfully" });
  } catch (error) {
    log.error("Error configuring node:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/nodes/node/:id/configure-command", isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const node = await db.get(id + "_node");

    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }

    const configureKey = uuidv4();
    node.configureKey = configureKey;
    await db.set(id + "_node", node);

    const panelUrl = `${req.protocol}://${req.get('host')}`;

    const configureCommand = `npm run configure -- --panel ${panelUrl} --key ${configureKey}`;

    res.json({
      nodeId: id,
      configureCommand: configureCommand,
    });
  } catch (error) {
    log.error("Error generating configure command:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== UPDATE NODE - FULLY SUPPORTS ALL NEW FIELDS (NO DATA LOSS) ====================
router.post("/admin/nodes/node/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  let node = await db.get(id + "_node");
  if (!node) return res.status(404).json({ error: "Node not found" });

  // Merge new values safely (preserves all existing fields)
  if (req.body.name) node.name = req.body.name;
  if (req.body.description !== undefined) node.description = req.body.description.trim();
  if (req.body.address) node.address = req.body.address;
  if (req.body.port) node.port = parseInt(req.body.port);
  if (req.body.sftpPort) node.sftpPort = parseInt(req.body.sftpPort);
  if (req.body.ftp) {
    node.ftp = {
      ip: (req.body.ftp.ip) ? req.body.ftp.ip.trim() : node.ftp?.ip || "0.0.0.0",
      port: parseInt(req.body.ftp.port) || node.ftp?.port || 3003
    };
  }
  if (req.body.location !== undefined) node.location = req.body.location || null;
  if (req.body.ram !== undefined) node.ram = parseInt(req.body.ram);
  if (req.body.disk !== undefined) node.disk = parseInt(req.body.disk);
  if (req.body.memoryOverallocate !== undefined) node.memoryOverallocate = parseInt(req.body.memoryOverallocate);
  if (req.body.diskOverallocate !== undefined) node.diskOverallocate = parseInt(req.body.diskOverallocate);
  if (req.body.uploadSize) node.uploadSize = parseInt(req.body.uploadSize);
  if (req.body.behindProxy !== undefined) node.behindProxy = req.body.behindProxy === "true" || req.body.behindProxy === true;
  if (req.body.connectionProtocol !== undefined) node.connectionProtocol = req.body.connectionProtocol;
  if (req.body.resourceMode !== undefined) node.resourceMode = req.body.resourceMode;
  if (req.body.serverFileDirectory) node.serverFileDirectory = req.body.serverFileDirectory.trim();
  if (req.body.publicIp !== undefined) node.publicIp = req.body.publicIp.trim() || node.address;
  if (req.body.maintenanceMode !== undefined) node.maintenanceMode = req.body.maintenanceMode === "true" || req.body.maintenanceMode === true;
  if (req.body.connectionType) node.connectionType = req.body.connectionType;
  if (req.body.maxServers) node.maxServers = parseInt(req.body.maxServers);
  if (req.body.healthCheckUrl !== undefined) node.healthCheckUrl = req.body.healthCheckUrl.trim();
  if (req.body.tags !== undefined) node.tags = req.body.tags ? req.body.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  if (req.body.trustedProxies !== undefined) node.trustedProxies = req.body.trustedProxies ? req.body.trustedProxies.split(",").map(t => t.trim()).filter(Boolean) : [];

  // Basic validation for critical fields
  if (!node.name || !node.address || !node.port) {
    return res.status(400).json({ error: "Missing required fields (name, address, port)" });
  }

  await db.set(id + "_node", node);
  const updatedNode = await checkNodeStatus(node);
  invalidateCache("nodes");
  logAudit(req.user.userId, req.user.username, "node:update", req.ip);
  res.status(200).json(updatedNode);
});

router.post("/admin/nodes/overview/radar/check", isAdmin, async (req, res) => {
  try {
    const nodes = (await db.get("nodes")) || [];
    let instances = (await db.get("instances")) || [];

    for (const nodeid of nodes) {
      const node = await db.get(`${nodeid}_node`);
      if (node) {
        const nodestatus = await checkNodeStatus(node);
        if (nodestatus) {
          try {
            const response = await axios.get(
              `http://${node.address}:${node.port}/check/all`,
              {
                auth: {
                  username: "kspanel",
                  password: node.apiKey,
                },
              }
            );

            if (response.data.flaggedMessages.length > 0) {
              for (const message of response.data.flaggedMessages) {
                const { containerId, message: flaggedMessage } = message;
                for (let instance of instances) {
                  if (instance.ContainerId === containerId) {
                    instance.suspended = true;
                    instance["suspended-flagg"] = flaggedMessage;
                  }
                }
              }
            }
          } catch (error) {
            if (error.response && error.response.status === 401) {
            } else {
              console.error(`Error checking node ${nodeid}:`, error.message);
            }
          }
        }
      }
    }

    await db.set("instances", instances);
    res.status(200).send("Node checks completed.");
  } catch (error) {
    console.error("Error during node check:", error.message);
    res.status(500).send("An error occurred while checking nodes.");
  }
});

router.get("/admin/nodes/node/:id/resourceMonitor", isAdmin, async (req, res) => {
  const { id } = req.params;
  const node = await db.get(id + "_node");
  if (!node) return res.status(404).json({ error: "Node not found" });

  try {
    const protocol = node.connectionProtocol === 'https' ? 'https' : 'http';
    const monitorUrl = `${protocol}://${node.address}:${node.port}/resourceMonitor`;

    const response = await axios.get(monitorUrl, {
      auth: {
        username: "kspanel",
        password: node.apiKey,
      },
      timeout: 5000,
      ...(node.behindProxy && { headers: { 'X-Forwarded-Proto': 'https' } }),
    });

    // If resourceMode is auto and ram/disk are 0, update them with fetched values
    if (node.resourceMode === 'auto' && node.ram === 0 && response.data?.ram) {
      node.ram = Math.round(parseFloat(response.data.ram.total));
      node.disk = Math.round(parseFloat(response.data.disk.total));
      await db.set(id + "_node", node);
      invalidateNodeCache(id);
    }

    res.json(response.data);
  } catch (error) {
    log.error(`Resource monitor fetch failed for node ${id}: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

// POST: Add allocations to a node (admin only) - YOUR EXISTING LOGIC
router.post('/admin/nodes/overview/:id/allocations', isAdmin, async (req, res) => {
  const { id } = req.params;
  const node = await db.get(`${id}_node`);
  if (!node) {
    return res.status(404).json({ error: 'Node not found' });
  }

  const { ip, alias, portsInput } = req.body;
  if (!portsInput) {
    return res.status(400).json({ error: 'Missing portsInput' });
  }

  try {
    const ports = parsePorts(portsInput);
    const allocationsKey = `${id}_allocations`;
    let allocations = (await db.get(allocationsKey)) || [];

    const existingPorts = allocations
      .filter(a => a.ip === (ip || node.address))
      .map(a => a.port);
    const conflicts = ports.filter(p => existingPorts.includes(p));
    if (conflicts.length > 0) {
      return res.status(409).json({ error: `Ports already allocated: ${conflicts.join(', ')}` });
    }

    const newAllocs = ports.map(port => ({
      id: uuidv4(),
      ip: ip || node.address,
      alias: alias || null,
      port,
      assignedTo: null,
    }));
    allocations = [...allocations, ...newAllocs];
    await db.set(allocationsKey, allocations);

    invalidateNodeCache(id);
    logAudit(req.user.userId, req.user.username, 'node:allocation:add', req.ip);

    res.status(201).json({ message: `${newAllocs.length} allocations added`, allocations: newAllocs });
  } catch (err) {
    log.error('Error adding allocations:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET: List available allocations for a node (for select dropdown) - YOUR EXISTING LOGIC
router.get('/admin/nodes/overview/:id/available-allocations', isAdmin, async (req, res) => {
  const { id } = req.params;
  const allocationsKey = `${id}_allocations`;
  const allocations = (await db.get(allocationsKey)) || [];
  const available = allocations
    .filter(a => !a.assignedTo)
    .map(a => ({
      id: a.id,
      label: `${a.ip}:${a.port}${a.alias ? ` (${a.alias})` : ''}`,
    }));

  res.json(available);
});

module.exports = router;
