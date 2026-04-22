const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const crypto = require("crypto");                    // ← REQUIRED FOR ACCESS KEY GENERATION
const { db } = require("../../handlers/db.js");
const { parsePorts } = require('../../utils/dbHelper.js');
const { logAudit } = require("../../handlers/auditLog.js");
const { isAdmin, hasPermission } = require("../../utils/isAdmin.js");
const { checkNodeStatus, checkMultipleNodesStatus, invalidateNodeCache } = require("../../utils/nodeHelper.js");
const { getPaginatedNodes, invalidateCache } = require("../../utils/dbHelper.js");
const log = new (require("cat-loggr"))();

// ==================== FULLY ENHANCED NODES ROUTES (Pterodactyl + FTP + All Extras) ====================

router.get("/admin/nodes/overview", hasPermission('manage_nodes'), async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 20;
  const search = req.query.search || "";
  const locationFilter = req.query.location || "";
  const categoryFilter = req.query.category || "";

  let allNodeIds = await db.get("nodes") || [];

  // Fetch all node objects for filtering
  let allNodes = await Promise.all(allNodeIds.map(id => db.get(id + "_node")));
  allNodes = allNodes.filter(Boolean);

  // Apply filters
  if (search || locationFilter || categoryFilter) {
    allNodes = allNodes.filter(n => {
      const searchMatch = !search ||
        n.name.toLowerCase().includes(search.toLowerCase()) ||
        n.address.toLowerCase().includes(search.toLowerCase()) ||
        n.id.includes(search);
      const locationMatch = !locationFilter || n.location === locationFilter;
      const categoryMatch = !categoryFilter || n.category === categoryFilter;
      return searchMatch && locationMatch && categoryMatch;
    });
  }

  const { paginate } = require("../../utils/dbHelper.js");
  const nodesResult = paginate(allNodes.map(n => n.id), page, pageSize);
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
        const portString = (protocol === 'https' && node.port === 443) || (protocol === 'http' && node.port === 80) ? '' : `:${node.port}`;
        const monitorUrl = `${protocol}://${node.address}${portString}/resourceMonitor`;

        const response = await axios.get(monitorUrl, {
          auth: {
            username: "kspanel",
            password: node.apiKey,
          },
          timeout: 4000
        });
        node.resources = response.data;

        // Auto-populate RAM/Disk for "auto" mode nodes
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
    categories: await db.get("node_categories") || ["Default", "High Performance", "Storage"],
    filters: { search, location: locationFilter, category: categoryFilter }
  });
});

// ==================== NEW: CREATE NODE PAGE (create.ejs) ====================
router.get("/admin/nodes/create", hasPermission('manage_nodes'), async (req, res) => {
  const locationIds = (await db.get("locations")) || [];
  const locations = [];
  for (const locId of locationIds) {
    const loc = await db.get(locId + "_location");
    if (loc) locations.push(loc);
  }

  const categories = await db.get("node_categories") || ["Default", "High Performance", "Storage"];

  res.render("admin/nodes/create", {
    req,
    user: req.user,
    locations,
    categories
  });
});

// Location CRUD
router.post("/admin/nodes/locations/create", hasPermission('manage_nodes'), async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  const id = uuidv4();
  const loc = { id, name };
  await db.set(`${id}_location`, loc);
  const ids = await db.get("locations") || [];
  ids.push(id);
  await db.set("locations", ids);
  res.json(loc);
});

router.post("/admin/nodes/locations/delete", hasPermission('manage_nodes'), async (req, res) => {
  const { id } = req.body;
  await db.delete(`${id}_location`);
  const ids = await db.get("locations") || [];
  const newIds = ids.filter(i => i !== id);
  await db.set("locations", newIds);
  res.json({ success: true });
});

// Category CRUD
router.post("/admin/nodes/categories/create", hasPermission('manage_nodes'), async (req, res) => {
  const { name } = req.body;
  const cats = await db.get("node_categories") || ["Default", "High Performance", "Storage"];
  if (!cats.includes(name)) cats.push(name);
  await db.set("node_categories", cats);
  res.json({ categories: cats });
});

router.post("/admin/nodes/categories/delete", hasPermission('manage_nodes'), async (req, res) => {
  const { name } = req.body;
  const cats = await db.get("node_categories") || ["Default", "High Performance", "Storage"];
  const newCats = cats.filter(c => c !== name);
  await db.set("node_categories", newCats);
  res.json({ categories: newCats });
});

router.get("/admin/nodes/node/:id/stats", hasPermission('manage_nodes'), async (req, res) => {
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
router.post("/admin/nodes/create", hasPermission('manage_nodes'), async (req, res) => {
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

  // Handle resourceMode
  let finalRam = 0;
  let finalDisk = 0;
  if (resourceMode === 'manual') {
    if (!ram || !disk) {
      return res.status(400).json({ error: "RAM and Disk are required in Manual mode." });
    }
    finalRam = parseInt(ram);
    finalDisk = parseInt(disk);
  } else if (resourceMode === 'auto') {
    finalRam = 0;
    finalDisk = 0;
  } else {
    return res.status(400).json({ error: "Invalid resourceMode: must be 'auto' or 'manual'." });
  }

  // ==================== FTP VALIDATION LOGIC ====================
  if (!ftp || typeof ftp.port === 'undefined' || isNaN(parseInt(ftp.port))) {
    return res.status(400).json({ error: "FTP Port is required and must be a valid number." });
  }
  const ftpPortNum = parseInt(ftp.port);
  if (ftpPortNum < 1 || ftpPortNum > 65535) {
    return res.status(400).json({ error: "FTP Port must be between 1 and 65535." });
  }
  const ftpIpFinal = (ftp.ip || "0.0.0.0").toString().trim();

  const nodeId = uuidv4();
  const configureKey = uuidv4();   // FIXED: generated only once at creation

  const { category } = req.body;

  const node = {
    id: nodeId,
    name: name.trim(),
    description: "",
    address: address.trim(),
    port: parseInt(port),
    sftpPort: parseInt(sftpPort || 2022),
    ftp: {
      ip: ftpIpFinal,
      port: ftpPortNum
    },
    location: location || null,
    category: category || "Default",
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
    configureKey,          // FIXED: persistent config token
    status: "Unconfigured",
    createdAt: Date.now()
  };

  try {
    await db.set(`${nodeId}_node`, node);
    const nodes = (await db.get("nodes")) || [];
    nodes.push(nodeId);
    await db.set("nodes", nodes);
    invalidateCache("nodes");

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

    logAudit(req.user.userId, req.user.username, "node:create", req.ip, { name, address });
    res.status(201).json({ ...node, configureKey });
  } catch (err) {
    log.error("Error creating node:", err);
    res.status(500).json({ error: "Database error during creation." });
  }
});

router.post("/admin/nodes/delete", hasPermission('manage_nodes'), async (req, res) => {
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

// ==================== CONFIGURE ENDPOINT - NOW RETURNS FULL CONFIG (FIXED FOR NEW DAEMON) ====================
router.post("/admin/nodes/configure", async (req, res) => {
  const { configureKey } = req.query;

  if (!configureKey) {
    return res.status(400).json({ error: "Missing configureKey" });
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

    // Generate real access key (daemon will receive this as "key")
    const newAccessKey = crypto.randomBytes(32).toString("hex");

    foundNode.apiKey = newAccessKey;
    foundNode.status = "Configured";
    // configureKey stays fixed forever - do NOT set to null

    await db.set(foundNode.id + "_node", foundNode);
    invalidateNodeCache(foundNode.id);

    // ==================== FULL CONFIG JSON SENT TO DAEMON ====================
    const panelUrl = `${req.protocol}://${req.get('host')}`;

    const fullConfig = {
      "_note1": "WARNING: You do not need to touch the following values. KS Daemon will automatically set them.",
      "remote": panelUrl,
      "key": newAccessKey,
      "_note3": "Other configuration options below. Hostname must be set for FTP to return the correct info.",
      "port": foundNode.port,
      "version": "1.0.0",
      "mysql": {
        "host": "localhost",
        "user": "root",
        "password": ""
      },
      "ftp": {
        "ip": foundNode.ftp.ip,
        "port": foundNode.ftp.port
      },
      "ssl": {
        "enabled": foundNode.connectionProtocol === "https",
        "cert": "$HOME/.kspanel/database/wings/letsencrypt/live/kswings/fullchain.pem",
        "key": "$HOME/.kspanel/database/wings/letsencrypt/live/kswings/privkey.pem"
      },
      "proxy": foundNode.behindProxy
    };

    res.status(200).json(fullConfig);
  } catch (error) {
    log.error("Error configuring node:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== CONFIGURE COMMAND - FIXED TOKEN (no longer changes) ====================
router.post("/admin/nodes/status", hasPermission('manage_nodes'), async (req, res) => {
  // Mock/Helper for frontend checkStatus
  res.json({ running: true, pid: process.pid });
});

router.get("/admin/nodes/node/:id/configure-command", hasPermission('manage_nodes'), async (req, res) => {
  const { id } = req.params;

  try {
    const node = await db.get(id + "_node");

    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }

    // FIXED: Do NOT regenerate configureKey - use the existing fixed one
    const configureKey = node.configureKey;

    const panelUrl = `${req.protocol}://${req.get('host')}`;

    const configureCommand = `./kswings --configure --panel ${panelUrl} --key ${configureKey}`;

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
router.post("/admin/nodes/node/:id", hasPermission('manage_nodes'), async (req, res) => {
  const { id } = req.params;
  let node = await db.get(id + "_node");
  if (!node) return res.status(404).json({ error: "Node not found" });

  if (req.body.name) node.name = req.body.name;
  if (req.body.description !== undefined) node.description = req.body.description.trim();
  if (req.body.address) node.address = req.body.address;
  if (req.body.port) node.port = parseInt(req.body.port);
  if (req.body.sftpPort) node.sftpPort = parseInt(req.body.sftpPort);
  if (req.body.ftp) {
    node.ftp = {
      ip: (req.body.ftp.ip || node.ftp?.ip || "0.0.0.0").trim(),
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

  if (!node.name || !node.address || !node.port) {
    return res.status(400).json({ error: "Missing required fields (name, address, port)" });
  }

  await db.set(id + "_node", node);
  const updatedNode = await checkNodeStatus(node);
  invalidateCache("nodes");
  logAudit(req.user.userId, req.user.username, "node:update", req.ip);
  res.status(200).json(updatedNode);
});

router.post("/admin/nodes/overview/radar/check", hasPermission('manage_nodes'), async (req, res) => {
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

router.get("/admin/nodes/node/:id/resourceMonitor", hasPermission('manage_nodes'), async (req, res) => {
  const { id } = req.params;
  const node = await db.get(id + "_node");
  if (!node) return res.status(404).json({ error: "Node not found" });

  try {
    const protocol = node.connectionProtocol === 'https' ? 'https' : 'http';
    const portString = (protocol === 'https' && node.port === 443) || (protocol === 'http' && node.port === 80) ? '' : `:${node.port}`;
    const monitorUrl = `${protocol}://${node.address}${portString}/resourceMonitor`;

    const response = await axios.get(monitorUrl, {
      auth: {
        username: "kspanel",
        password: node.apiKey,
      },
      timeout: 5000,
      ...(node.behindProxy && { headers: { 'X-Forwarded-Proto': 'https' } }),
    });

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

// POST: Add allocations to a node (admin only)
router.post('/admin/nodes/overview/:id/allocations', hasPermission('manage_nodes'), async (req, res) => {
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

// GET: List available allocations for a node
router.get('/admin/nodes/overview/:id/available-allocations', hasPermission('manage_nodes'), async (req, res) => {
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
