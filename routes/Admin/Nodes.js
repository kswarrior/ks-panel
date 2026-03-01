const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const { db } = require("../../handlers/db.js");
const { parsePorts } = require('../../utils/dbHelper.js'); // Adjust path if needed
const { logAudit } = require("../../handlers/auditLog.js");
const { isAdmin } = require("../../utils/isAdmin.js");
const { checkNodeStatus, checkMultipleNodesStatus, invalidateNodeCache } = require("../../utils/nodeHelper.js");
const { getPaginatedNodes, invalidateCache } = require("../../utils/dbHelper.js");
const log = new (require("cat-loggr"))();

router.get("/admin/nodes", isAdmin, async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 20;

  // Use pagination for nodes
  const nodesResult = await getPaginatedNodes(page, pageSize);
  let nodeIds = nodesResult.data;
  
  let instances = (await db.get("instances")) || [];
  let set = {};
  
  // Optimized: Count instances per node
  nodeIds.forEach(function (nodeId) {
    set[nodeId] = 0;
    instances.forEach(function (instance) {
      if (instance.Node.id == nodeId) {
        set[nodeId]++;
      }
    });
  });

  // Use optimized batch operation for node status checks
  let nodes = await checkMultipleNodesStatus(nodeIds);

  // Fetch locations from DB (mirroring nodes structure)
  const locationIds = (await db.get("locations")) || [];
  const locations = [];
  for (const locId of locationIds) {
    const loc = await db.get(locId + "_location");
    if (loc) {
      locations.push(loc);
    }
  }

  res.render("admin/nodes", {
    req,
    user: req.user,
    nodes,
    set,
    pagination: nodesResult.pagination,
    locations,  // NEW: Pass to template
  });
});

router.get("/admin/node/:id/stats", isAdmin, async (req, res) => {
  const { id } = req.params;

  // Get cached node status or fetch fresh if needed
  let node = await db.get(id + "_node");
  if (!node) {
    return res.status(404).send("Node not found");
  }
  
  // Check node status (with cache)
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
    log.debug(`Fetching stats from wings: http://${node.address}:${node.port}/stats`);  // ADD: Debug
    const response = await axios.get(
      `http://kspanel:${node.apiKey}@${node.address}:${node.port}/stats`,
      { timeout: 5000 }
    );
    stats = response.data;

    if (stats && stats.uptime !== "0d 0h 0m") {
      status = "Online";
    }
  } catch (error) {
    log.error(`Stats fetch failed for node ${id}: ${error.message}`);  // ADD: Detailed log
    if (error.response) log.debug('Wings response:', error.response.data);  // ADD
  }

  let set = { [id]: instanceCount };

  res.render("admin/node_stats", {
    req,
    user: req.user,
    stats,
    node,
    set,
    status,
  });
});

router.post("/nodes/create", isAdmin, async (req, res) => {
  const configureKey = uuidv4();
  const node = {
    id: uuidv4(),
    name: req.body.name,
    ram: req.body.ram,
    disk: req.body.disk,
    address: req.body.address,
    port: req.body.port,
    location: req.body.location || null,  // Keep as optional
    apiKey: null,
    configureKey: configureKey,
    status: "Unconfigured",
  };

  if (
    !req.body.name ||
    !req.body.ram ||
    !req.body.disk ||
    !req.body.address ||
    !req.body.port
  ) {
    return res.status(400).json({ error: "Form validation failure: Missing required fields." });
  }

  try {
    await db.set(`${node.id}_node`, node);
    const nodes = (await db.get("nodes")) || [];
    nodes.push(node.id);
    await db.set("nodes", nodes);
    invalidateCache("nodes");
    logAudit(req.user.userId, req.user.username, "node:create", req.ip);
    res.status(201).json({ ...node, configureKey });
  } catch (err) {
    log.error("Error creating node:", err);
    res.status(500).json({ error: "Database error during creation." });
  }
});

router.post("/nodes/delete", isAdmin, async (req, res) => {
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

    // Invalidate cache after deletion
    invalidateNodeCache(node.id);
    invalidateCache("nodes");

    logAudit(req.user.userId, req.user.username, "node:delete", req.ip);
    res.status(200).json({ success: true });
  } catch (error) {
    log.error("Error deleting node:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /nodes/configure
 * Allows a node to set its own access key using the configureKey.
 * The request must include a valid authKey from config.json for security.
 */
router.post("/nodes/configure", async (req, res) => {
  const { configureKey, accessKey } = req.query;

  if (!configureKey || !accessKey) {
    return res.status(400).json({ error: "Missing configureKey or accessKey" });
  }

  try {
    // Find the node with the matching configureKey
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

    // Update the node with the new accessKey
    foundNode.apiKey = accessKey;
    foundNode.status = "Configured";
    foundNode.configureKey = null; // Remove the configureKey after successful configuration

    await db.set(foundNode.id + "_node", foundNode);

    // Invalidate cache after configuration
    invalidateNodeCache(foundNode.id);

    res.status(200).json({ message: "Node configured successfully" });
  } catch (error) {
    log.error("Error configuring node:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/node/:id/configure-command", isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the node from the database
    const node = await db.get(id + "_node");

    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }

    // Generate a new configure key
    const configureKey = uuidv4();

    // Update the node with the new configure key
    node.configureKey = configureKey;
    await db.set(id + "_node", node);

    // FIXED: Correct panelUrl construction with proper template literal interpolation
    const panelUrl = `${req.protocol}://${req.get('host')}`;  // e.g., "http://localhost:3000" or your domain

    // Construct the configuration command
    const configureCommand = `npm run configure -- --panel ${panelUrl} --key ${configureKey}`;

    // Return the configuration command
    res.json({
      nodeId: id,
      configureCommand: configureCommand,
    });
  } catch (error) {
    log.error("Error generating configure command:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/node/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  const cnode = await db.get(id + "_node");
  if (!cnode || !id) return res.status(400).json({ error: "Node not found" });  // FIXED: JSON error

  try {  // ADD: Try-catch for DB errors
    const node = {
      id: id,
      name: req.body.name,
      ram: req.body.ram,
      disk: req.body.disk,
      address: req.body.address,
      port: req.body.port,
      location: req.body.location || cnode.location,
      apiKey: req.body.apiKey,
      status: "Unknown",
    };

    if (!req.body.name || !req.body.ram || !req.body.disk || !req.body.address || !req.body.port) {
      return res.status(400).json({ error: "Missing required fields" });  // ADD: Validation
    }

    await db.set(node.id + "_node", node);
    const updatedNode = await checkNodeStatus(node);
    invalidateCache("nodes");  // ADD: Refresh cache
    logAudit(req.user.userId, req.user.username, "node:update", req.ip);
    res.status(200).json(updatedNode);  // FIXED: 200, JSON
  } catch (err) {
    log.error("Error updating node:", err);  // ADD: Log
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/admin/nodes/radar/check", isAdmin, async (req, res) => {
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

// POST: Add allocations to a node (admin only)
router.post('/admin/nodes/:id/allocations', isAdmin, async (req, res) => {
  const { id } = req.params;
  const node = await db.get(`${id}_node`);
  if (!node) {
    return res.status(404).json({ error: 'Node not found' });
  }

  const { ip, alias, portsInput } = req.body; // ip (string, optional fallback to node.address), alias (string, optional), portsInput (string)
  if (!portsInput) {
    return res.status(400).json({ error: 'Missing portsInput' });
  }

  try {
    const ports = parsePorts(portsInput);
    const allocationsKey = `${id}_allocations`;
    let allocations = (await db.get(allocationsKey)) || [];

    // Check for conflicts (existing ports on same ip)
    const existingPorts = allocations
      .filter(a => a.ip === (ip || node.address))
      .map(a => a.port);
    const conflicts = ports.filter(p => existingPorts.includes(p));
    if (conflicts.length > 0) {
      return res.status(409).json({ error: `Ports already allocated: ${conflicts.join(', ')}` });
    }

    // Create new allocations
    const newAllocs = ports.map(port => ({
      id: uuidv4(),
      ip: ip || node.address, // Fallback to node's address
      alias: alias || null,
      port,
      assignedTo: null,
    }));
    allocations = [...allocations, ...newAllocs];
    await db.set(allocationsKey, allocations);

    invalidateNodeCache(id); // Invalidate as per your cache system
    logAudit(req.user.userId, req.user.username, 'node:allocation:add', req.ip);

    res.status(201).json({ message: `${newAllocs.length} allocations added`, allocations: newAllocs });
  } catch (err) {
    log.error('Error adding allocations:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET: List available allocations for a node (for select dropdown)
router.get('/admin/nodes/:id/available-allocations', isAdmin, async (req, res) => {
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
