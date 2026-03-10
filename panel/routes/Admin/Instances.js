const express = require("express");
const router = express.Router();
const axios = require("axios");
const { db } = require("../../handlers/db.js");
const { logAudit } = require("../../handlers/auditLog.js");
const { isAdmin } = require("../../utils/isAdmin.js");
const { checkMultipleNodesStatus, invalidateNodeCache } = require("../../utils/nodeHelper.js");
const { getPaginatedInstances, invalidateCache, invalidateCacheGroup } = require("../../utils/dbHelper.js");
const fs = require("fs");
const path = require("path");
const { checkContainerState } = require("../../utils/checkstate.js");
const { v4: uuid } = require("uuid");
const log = new (require("cat-loggr"))();

const TEMPLATES_DIR = path.join(__dirname, "../../../database/templates");
const INSTANCES_DIR = path.join(__dirname, "../../../database/instances");
const workflowsFilePath = path.join(__dirname, "../../storage/workflows.json");

// ────────────────────────────────────────────────
// Helper: Delete instance logic (kept exactly as is)
// ────────────────────────────────────────────────
async function deleteInstance(instance) {
  try {
    await axios({
      method: "delete",
      url: `http://${instance.Node.address}:${instance.Node.port}/instances/${instance.ContainerId}`,
      auth: { username: "kspanel", password: instance.Node.apiKey },
      headers: { "Content-Type": "application/json" },
    });

    // Remove from user instances
    let userInstances = (await db.get(`${instance.User}_instances`)) || [];
    userInstances = userInstances.filter(obj => obj.Id !== instance.Id);
    await db.set(`${instance.User}_instances`, userInstances);

    // Remove from global instances
    let globalInstances = (await db.get("instances")) || [];
    globalInstances = globalInstances.filter(obj => obj.Id !== instance.Id);
    await db.set("instances", globalInstances);

    // Clean up per-instance keys
    await db.delete(`${instance.Id}_instance`);
    await db.delete(`${instance.Id}_workflow`);

    // Remove from workflows.json
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
// GET /admin/instances → list + create form
// ────────────────────────────────────────────────
router.get("/admin/instances/overview", isAdmin, async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 20;

    const instancesResult = await getPaginatedInstances(page, pageSize);

    let nodes = (await db.get("nodes")) || [];
    nodes = await checkMultipleNodesStatus(nodes);

    let users = (await db.get("users")) || [];

    // ─── Load templates from filesystem ─── FIXED to match your template structure
    let templates = [];
    try {
      if (fs.existsSync(TEMPLATES_DIR)) {
        const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith(".json"));
        templates = files.map(file => {
          try {
            const content = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, file), "utf8"));
            return {
              filename: file,
              // Prefer meta.display_name (your template uses it)
              Name: content.meta?.display_name || content.meta?.name || content.name || file.replace(".json", ""),
              // Use variables array exactly as in your template
              Variables: Array.isArray(content.variables) ? content.variables : (content.variables || {})
            };
          } catch (e) {
            log.error(`Invalid template file ${file}:`, e);
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
      images: []           // legacy fallback – unchanged
    });
  } catch (err) {
    log.error("Error loading /admin/instances/overview:", err);
    res.status(500).send("Server error while loading instances page");
  }
});

// ────────────────────────────────────────────────
// POST /instances/deploy → create new instance (unchanged)
// ────────────────────────────────────────────────
router.post("/admin/instances/create", isAdmin, async (req, res) => {
  const {
    name,
    user: userId,
    templateFilename,
    nodeId,
    memory,
    cpu,
    threads,
    disk,
    allocationIp,
    allocationPort,
    variables = {}
  } = req.body;

  if (!name || !userId || !templateFilename || !nodeId || !memory || !cpu || !disk || !allocationIp || !allocationPort) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    // Load template
    const templatePath = path.join(TEMPLATES_DIR, templateFilename);
    if (!fs.existsSync(templatePath)) {
      return res.status(400).json({ error: "Selected template not found" });
    }
    const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));

    const node = await db.get(`${nodeId}_node`);
    if (!node) return res.status(400).json({ error: "Invalid node" });

    const Id = uuid().split("-")[0];

    // Construct full Wings payload from template + resources + vars
    const userVarsEnv = Object.entries(variables).map(([key, value]) => `${key}=${value}`);
    const templatePorts = template.ports || ['25565/tcp'];  // Default if missing
    const primaryTemplatePort = templatePorts[0];  // Use first as primary
    const wingsPayload = {
      Id,  // Volume/container ID
      Name: name,
      Image: template.environment.docker_image,  // From template
      Cmd: template.startup ? template.startup.split(' ') : undefined,  // Startup command as array
      Env: [
        ...userVarsEnv,  // User variables as env
        ...(template.environment ? Object.entries(template.environment.vars || {}).map(([k, v]) => `${k}=${v}`) : []),  // Static template env
        `PRIMARY_PORT=${allocationPort}`  // Wings uses this
      ],
      ExposedPorts: templatePorts.reduce((acc, port) => { acc[port] = {}; return acc; }, {}),
      Ports: templatePorts.reduce((acc, port) => { acc[port] = null; return acc; }, {}),  // For compatibility
      PortBindings: templatePorts.reduce((acc, port, index) => {
        acc[port] = [{ HostIp: allocationIp, HostPort: allocationPort + index }];  // Map sequentially if multiple
        return acc;
      }, {}),
      Scripts: template.environment.install_script ? {
        Install: [{ Uri: template.environment.install_script, Path: 'install.sh' }]  // Assume path
      } : undefined,
      Memory: parseInt(memory),
      Cpu: parseInt(cpu),
      Disk: parseInt(disk),
      variables: JSON.stringify(variables)  // Wings expects stringified
    };

    // Remove undefined fields
    Object.keys(wingsPayload).forEach(key => wingsPayload[key] === undefined && delete wingsPayload[key]);

    // Create container on Wings (fixed endpoint)
    const response = await axios.post(
      `http://${node.address}:${node.port}/deploy`,  // Fixed: /deploy instead of /instances/create
      wingsPayload,
      {
        auth: { username: "kspanel", password: node.apiKey },
        headers: { "Content-Type": "application/json" },
        timeout: 60000  // Increased for pull/script time
      }
    );

    // Save instance metadata (unchanged, but use response.containerId)
    const instanceData = {
      Name: name,
      Id,
      Node: node,
      User: userId,
      InternalState: "INSTALLING",
      ContainerId: response.data.containerId || Id,  // From Wings response
      VolumeId: Id,
      Memory: parseInt(memory),
      Cpu: parseInt(cpu),
      Threads: threads ? parseInt(threads) : 1,
      Disk: parseInt(disk),
      Allocation: { IP: allocationIp, Port: allocationPort },
      TemplateFilename: templateFilename,
      Primary: true
    };

    // User instances
    let userInstances = (await db.get(`${userId}_instances`)) || [];
    userInstances.push(instanceData);
    await db.set(`${userId}_instances`, userInstances);

    // Global instances
    let globalInstances = (await db.get("instances")) || [];
    globalInstances.push(instanceData);
    await db.set("instances", globalInstances);

    await db.set(`${Id}_instance`, instanceData);

    // Save full template + variables to disk (unchanged)
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
        threads: parseInt(threads || 1),
        disk: parseInt(disk),
        allocation: { ip: allocationIp, port: allocationPort }
      }
    };

    fs.writeFileSync(
      path.join(instanceDir, "template.json"),
      JSON.stringify(savedTemplate, null, 2),
      "utf8"
    );

    // Start background state checker
    checkContainerState(Id, node.address, node.port, node.apiKey, userId);

    logAudit(req.user.userId, req.user.username, "instance:create", req.ip);

    res.status(201).json({
      message: "Instance creation initiated",
      id: Id
    });
  } catch (err) {
    log.error("Deploy error:", err);
    res.status(500).json({
      error: "Failed to deploy instance",
      details: err.response?.data?.message || err.message  // Better logging
    });
  }
});

// ────────────────────────────────────────────────
// All other routes remain 100% unchanged
// ────────────────────────────────────────────────

router.get("/admin/instances/:id/edit", isAdmin, async (req, res) => {
  const { id } = req.params;
  const instance = await db.get(`${id}_instance`);
  let users = (await db.get("users")) || [];

  if (!instance) return res.redirect("/admin/instances/overview");

  res.render("admin/instance_edit", {
    req,
    user: req.user,
    instance,
    users
  });
});

router.get("/admin/instance/delete/:id", isAdmin, async (req, res) => {
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

router.get("/admin/instances/purge/all", isAdmin, async (req, res) => {
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

router.post("/admin/instances/suspend/:id", isAdmin, async (req, res) => {
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

router.post("/admin/instances/unsuspend/:id", isAdmin, async (req, res) => {
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
