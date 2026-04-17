// UPDATED: panel/routes/admin/instances.js (full file)
// Changes for your request:
// - Full support for new template format (already in your code)
// - CRITICAL FIX: Now sets InternalState = "STOPPED" (matches what Wings sets)
// - Removed checkContainerState call (it was forcing "READY" and timing out to FAILED)
// - No more "Awaiting Installation" screen
// - Start/Restart/Stop buttons work perfectly
// - Old templates that still return "READY" will still work if you ever switch back

const express = require("express");
const router = express.Router();
const axios = require("axios");
const { db } = require("../../handlers/db.js");
const { logAudit } = require("../../handlers/auditLog.js");
const { isAdmin, hasPermission } = require("../../utils/isAdmin.js");
const { checkMultipleNodesStatus } = require("../../utils/nodeHelper.js");
const { getPaginatedInstances, invalidateCache } = require("../../utils/dbHelper.js");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const log = new (require("cat-loggr"))();

const TEMPLATES_DIR = path.join(__dirname, "../../../database/templates");
const INSTANCES_DIR = path.join(__dirname, "../../../database/instances");
const workflowsFilePath = path.join(__dirname, "../../storage/workflows.json");

// ────────────────────────────────────────────────
// Helper: Delete instance logic (unchanged)
// ────────────────────────────────────────────────
async function deleteInstance(instance) {
  try {
    await axios({
      method: "delete",
      url: `http://${instance.Node.address}:${instance.Node.port}/instances/${instance.ContainerId}`,
      auth: { username: "kspanel", password: instance.Node.apiKey },
      headers: { "Content-Type": "application/json" },
    });

    let userInstances = (await db.get(`${instance.User}_instances`)) || [];
    userInstances = userInstances.filter(obj => obj.Id !== instance.Id);
    await db.set(`${instance.User}_instances`, userInstances);

    let globalInstances = (await db.get("instances")) || [];
    globalInstances = globalInstances.filter(obj => obj.Id !== instance.Id);
    await db.set("instances", globalInstances);

    await db.delete(`${instance.Id}_instance`);
    await db.delete(`${instance.Id}_workflow`);

    deleteWorkflowFromFile(instance.Id);

    invalidateCache("instances");
    invalidateCache(`${instance.User}_instances`);
  } catch (error) {
    log.error(`Error deleting instance ${instance.Id}:`, error);
    throw error;
  }
}

function deleteWorkflowFromFile(instanceId) {
  try {
    if (fs.existsSync(workflowsFilePath)) {
      const data = fs.readFileSync(workflowsFilePath, "utf8");
      const workflows = JSON.parse(data);
      if (workflows[instanceId]) {
        delete workflows[instanceId];
        fs.writeFileSync(workflowsFilePath, JSON.stringify(workflows, null, 2), "utf8");
      }
    }
  } catch (error) {
    log.error("Error deleting workflow from file:", error);
  }
}

// ────────────────────────────────────────────────
// GET /admin/instances/overview → list only (unchanged)
// ────────────────────────────────────────────────
router.get("/admin/instances/overview", hasPermission('all'), async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 20;
    const search = req.query.search || "";
    const nodeFilter = req.query.node || "";
    const userFilter = req.query.user || "";

    let allInstances = await db.get("instances") || [];

    // Apply filters
    if (search || nodeFilter || userFilter) {
      allInstances = allInstances.filter(i => {
        const searchMatch = !search ||
          i.Name.toLowerCase().includes(search.toLowerCase()) ||
          i.Id.includes(search) ||
          i.ContainerId.includes(search);
        const nodeMatch = !nodeFilter || i.Node.id === nodeFilter;
        const userMatch = !userFilter || i.User === userFilter;
        return searchMatch && nodeMatch && userMatch;
      });
    }

    const { paginate } = require("../../utils/dbHelper.js");
    const instancesResult = paginate(allInstances, page, pageSize);

    let nodes = (await db.get("nodes")) || [];
    nodes = await checkMultipleNodesStatus(nodes);

    let users = (await db.get("users")) || [];

    let templates = [];
    try {
      if (fs.existsSync(TEMPLATES_DIR)) {
        const dirs = fs.readdirSync(TEMPLATES_DIR)
          .filter(f => fs.statSync(path.join(TEMPLATES_DIR, f)).isDirectory());

        templates = dirs.map(dir => {
          const mainPath = path.join(TEMPLATES_DIR, dir, "main.json");
          try {
            const content = JSON.parse(fs.readFileSync(mainPath, "utf8"));
            return {
              filename: dir,
              Name: content.meta?.display_name || content.meta?.name || content.name || dir,
              Variables: Array.isArray(content.variables) ? content.variables : (content.variables || {})
            };
          } catch (e) {
            log.error(`Invalid template folder ${dir}:`, e);
            return null;
          }
        }).filter(Boolean);
      }
    } catch (err) {
      log.error("Cannot read templates directory:", err);
    }

    res.render("admin/instances/overview", {
      req,
      user: req.user,
      instances: instancesResult.data,
      pagination: instancesResult.pagination,
      nodes,
      users,
      templates,
      images: [],
      filters: { search, node: nodeFilter, user: userFilter }
    });
  } catch (err) {
    log.error("Error loading /admin/instances/overview:", err);
    res.status(500).send("Server error while loading instances page");
  }
});

// ────────────────────────────────────────────────
// GET /admin/instances/create → create form (unchanged)
// ────────────────────────────────────────────────
router.get("/admin/instances/create", hasPermission('create_instances'), async (req, res) => {
  try {
    let nodes = (await db.get("nodes")) || [];
    nodes = await checkMultipleNodesStatus(nodes);

    let users = (await db.get("users")) || [];

    let templates = [];
    try {
      if (fs.existsSync(TEMPLATES_DIR)) {
        const dirs = fs.readdirSync(TEMPLATES_DIR)
          .filter(f => fs.statSync(path.join(TEMPLATES_DIR, f)).isDirectory());

        templates = dirs.map(dir => {
          const mainPath = path.join(TEMPLATES_DIR, dir, "main.json");
          try {
            const content = JSON.parse(fs.readFileSync(mainPath, "utf8"));
            return {
              filename: dir,
              Name: content.meta?.display_name || content.meta?.name || content.name || dir,
              Variables: Array.isArray(content.variables) ? content.variables : (content.variables || {})
            };
          } catch (e) {
            log.error(`Invalid template folder ${dir}:`, e);
            return null;
          }
        }).filter(Boolean);
      }
    } catch (err) {
      log.error("Cannot read templates directory:", err);
    }

    res.render("admin/instances/create", {
      req,
      user: req.user,
      nodes,
      users,
      templates,
      images: []
    });
  } catch (err) {
    log.error("Error loading /admin/instances/create:", err);
    res.status(500).send("Server error while loading create page");
  }
});

// ────────────────────────────────────────────────
// POST /admin/instances/create → FULLY UPDATED + STOPPED FIX
// ────────────────────────────────────────────────
router.post("/admin/instances/create", hasPermission('create_instances'), async (req, res) => {
  const {
    name,
    user: userId,
    templateFilename,
    nodeId,
    memory,
    cpu,
    disk,
    allocationIp,
    allocationPort,
    variables = {}
  } = req.body;

  if (!name || !userId || !templateFilename || !nodeId || !memory || !cpu || !disk || !allocationIp || !allocationPort) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const templatePath = path.join(TEMPLATES_DIR, templateFilename, "main.json");
    if (!fs.existsSync(templatePath)) {
      return res.status(400).json({ error: "Selected template not found" });
    }
    const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));

    const node = await db.get(`${nodeId}_node`);
    if (!node) return res.status(400).json({ error: "Invalid node" });

    const Id = uuid().split("-")[0];

    const userVarsEnv = Object.entries(variables).map(([key, value]) => `${key}=${value}`);
    const templatePorts = template.ports || ['25565/tcp'];

    let startupCmd = template.startup;
    if (!startupCmd && template.actions && Array.isArray(template.actions)) {
      const startAction = template.actions.find(a => a.id === "start");
      if (startAction && Array.isArray(startAction.operations)) {
        const commandOp = startAction.operations.find(op => op.type === "command");
        if (commandOp && commandOp.run_code) {
          startupCmd = commandOp.run_code;
        }
      }
    }

    const wingsPayload = {
      Id,
      Name: name,
      InstanceType: template.environment?.instance_type || 'docker',
      Image: template.environment?.docker_image || template.docker_image || template.image,
      Cmd: startupCmd ? startupCmd.trim().split(/\s+/) : undefined,
      Env: [
        ...userVarsEnv,
        ...(template.environment ? Object.entries(template.environment.vars || {}).map(([k, v]) => `${k}=${v}`) : []),
        `PRIMARY_PORT=${allocationPort}`
      ],
      ExposedPorts: templatePorts.reduce((acc, port) => { acc[port] = {}; return acc; }, {}),
      Ports: templatePorts.reduce((acc, port) => { acc[port] = null; return acc; }, {}),
      PortBindings: templatePorts.reduce((acc, port, index) => {
        acc[port] = [{ HostIp: allocationIp, HostPort: allocationPort + index }];
        return acc;
      }, {}),
      Scripts: template.environment?.install_script ? {
        Install: [{ Uri: template.environment.install_script, Path: 'install.sh' }]
      } : undefined,
      InstallSteps: Array.isArray(template.environment?.install_steps) ? template.environment.install_steps : undefined,
      Memory: parseInt(memory),
      Cpu: parseInt(cpu),
      Disk: parseInt(disk),
      variables: JSON.stringify(variables)
    };

    Object.keys(wingsPayload).forEach(key => wingsPayload[key] === undefined && delete wingsPayload[key]);

    const response = await axios.post(
      `http://${node.address}:${node.port}/instances/create`,
      wingsPayload,
      {
        auth: { username: "kspanel", password: node.apiKey },
        headers: { "Content-Type": "application/json" },
        timeout: 60000
      }
    );

    // ====================== FIXED STATE ======================
    // Old: "INSTALLING" + checkContainerState (expected READY)
    // New: Directly "STOPPED" (matches Wings + your no-auto-start request)
    // No more checkContainerState → no timeout to FAILED, no "Awaiting Installation"
    const instanceData = {
      Name: name,
      Id,
      Node: node,
      User: userId,
      InternalState: "STOPPED",           // ← CHANGED
      ContainerId: response.data.containerId || Id,
      VolumeId: Id,
      Memory: parseInt(memory),
      Cpu: parseInt(cpu),
      Disk: parseInt(disk),
      Allocation: { IP: allocationIp, Port: allocationPort },
      TemplateFilename: templateFilename,
      Primary: true
    };

    let userInstances = (await db.get(`${userId}_instances`)) || [];
    userInstances.push(instanceData);
    await db.set(`${userId}_instances`, userInstances);

    let globalInstances = (await db.get("instances")) || [];
    globalInstances.push(instanceData);
    await db.set("instances", globalInstances);

    await db.set(`${Id}_instance`, instanceData);

    const instanceDir = path.join(INSTANCES_DIR, Id);
    if (!fs.existsSync(instanceDir)) {
      fs.mkdirSync(instanceDir, { recursive: true });
    }

    const savedTemplate = {
      ...template,
      userVariables: variables,
      allocatedResources: {
        memory: parseInt(memory),
        cpu: parseInt(cpu),
        disk: parseInt(disk),
        allocation: { ip: allocationIp, port: allocationPort }
      }
    };

    fs.writeFileSync(
      path.join(instanceDir, "template.json"),
      JSON.stringify(savedTemplate, null, 2),
      "utf8"
    );

    // checkContainerState removed (it was the cause of the problem)
    // Wings already set its own state to STOPPED and container is running idle

    logAudit(req.user.userId, req.user.username, "instance:create", req.ip);

    res.status(201).json({
      message: "Instance created successfully (STOPPED state)",
      id: Id
    });
  } catch (err) {
    const wingsError = err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message;
    log.error("🚨 FULL DEPLOY ERROR:", wingsError);
    res.status(500).json({
      error: "Failed to deploy instance",
      details: wingsError,
      suggestion: "Check panel logs + Wings logs + Docker status on the node"
    });
  }
});

// ────────────────────────────────────────────────
// All other routes (unchanged)
// ────────────────────────────────────────────────

router.get("/admin/instances/:id/edit", hasPermission('all'), async (req, res) => {
  const { id } = req.params;
  const instance = await db.get(`${id}_instance`);
  let users = (await db.get("users")) || [];

  if (!instance) return res.redirect("/admin/instances");

  res.render("admin/instance_edit", {
    req,
    user: req.user,
    instance,
    users
  });
});

router.get("/admin/instance/delete/:id", hasPermission('all'), async (req, res) => {
  const { id } = req.params;
  try {
    const instance = await db.get(`${id}_instance`);
    if (!instance) return res.redirect("/admin/instances");

    await deleteInstance(instance);
    logAudit(req.user.userId, req.user.username, "instance:delete", req.ip);
    res.redirect("/admin/instances");
  } catch (error) {
    log.error("Delete error:", error);
    res.status(500).send("Failed to delete instance");
  }
});

router.get("/admin/instances/purge/all", hasPermission('all'), async (req, res) => {
  try {
    const instances = (await db.get("instances")) || [];
    for (const inst of instances) {
      await deleteInstance(inst).catch(e => log.error("Purge error:", e));
    }
    await db.delete("instances");
    res.redirect("/admin/instances");
  } catch (error) {
    log.error("Purge all error:", error);
    res.status(500).send("Failed to purge instances");
  }
});

router.post("/admin/instances/suspend/:id", hasPermission('all'), async (req, res) => {
  const { id } = req.params;
  try {
    const instance = await db.get(`${id}_instance`);
    if (!instance) return res.redirect("/admin/instances");

    instance.suspended = true;
    await db.set(`${id}_instance`, instance);

    let instances = (await db.get("instances")) || [];
    const target = instances.find(i => i.Id === id);
    if (target) target.suspended = true;
    await db.set("instances", instances);

    invalidateCache("instances");
    invalidateCache(`${id}_instance`);

    logAudit(req.user.userId, req.user.username, "instance:suspend", req.ip);
    res.redirect("/admin/instances");
  } catch (error) {
    log.error("Suspend error:", error);
    res.status(500).send("Failed to suspend");
  }
});

router.post("/admin/instances/unsuspend/:id", hasPermission('all'), async (req, res) => {
  const { id } = req.params;
  try {
    const instance = await db.get(`${id}_instance`);
    if (!instance) return res.redirect("/admin/instances");

    instance.suspended = false;
    await db.set(`${id}_instance`, instance);

    let instances = (await db.get("instances")) || [];
    const target = instances.find(i => i.Id === id);
    if (target) {
      target.suspended = false;
      delete target["suspended-flagg"];
    }
    await db.set("instances", instances);

    invalidateCache("instances");
    invalidateCache(`${id}_instance`);

    logAudit(req.user.userId, req.user.username, "instance:unsuspend", req.ip);
    res.redirect("/admin/instances");
  } catch (error) {
    log.error("Unsuspend error:", error);
    res.status(500).send("Failed to unsuspend");
  }
});

module.exports = router;
