const express = require("express");
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const axios = require("axios");
const basicAuth = require('express-basic-auth');
const config = require('../../config.json');
const { db } = require("../../handlers/db.js");
const { logAudit } = require("../../handlers/auditLog.js");
const { isAdmin } = require("../../utils/isAdmin.js");
const { checkMultipleNodesStatus, invalidateNodeCache } = require("../../utils/nodeHelper.js");
const { getPaginatedInstances, invalidateCache, invalidateCacheGroup } = require("../../utils/dbHelper.js");
const fs = require("fs");
const path = require("path");
const log = new (require("cat-loggr"))();

const workflowsFilePath = path.join(__dirname, "../../storage/workflows.json");

async function deleteInstance(instance) {
  try {
    const requestData = {
      method: "delete",
      url: `http://${instance.Node.address}:${instance.Node.port}/instances/${instance.ContainerId}`,
      auth: {
        username: "kspanel",
        password: instance.Node.apiKey,
      },
      headers: {
        "Content-Type": "application/json",
      },
    };

    await axios(requestData);

    let userInstances = (await db.get(instance.User + "_instances")) || [];
    userInstances = userInstances.filter((obj) => obj.Id !== instance.Id);
    await db.set(instance.User + "_instances", userInstances);

    let globalInstances = (await db.get("instances")) || [];
    globalInstances = globalInstances.filter((obj) => obj.Id !== instance.Id);
    await db.set("instances", globalInstances);

    await db.delete(instance.Id + "_instance");

    await db.delete(instance.Id + "_workflow");
    await deleteWorkflowFromFile(instance.Id);

    // Invalidate cache after deletion
    invalidateCache("instances");
    invalidateCache(instance.User + "_instances");
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
        fs.writeFileSync(
          workflowsFilePath,
          JSON.stringify(workflows, null, 2),
          "utf8"
        );
      }
    } else {
      console.error("Workflows file does not exist.");
    }
  } catch (error) {
    console.error("Error deleting workflow from file:", error);
  }
}

router.get('/instances/list', basicAuth({
  users: { 'kspanel': config.key },
  challenge: true, // we'll disable this in prod
}), async (req, res) => {
  let instances = await db.get('instances');
  res.json(instances);
});

/**
 * GET /images/list
 * Provides a list of all images available in the database.
 *
 * @returns {Response} Sends a JSON response containing an array of images.
 */
router.get('/images/list', basicAuth({
  users: { 'kspanel': config.key },
  challenge: true, // we'll disable this in prod
}), async (req, res) => {
  let images = await db.get('images');
  res.json(images);
});

/**
 * GET /instances/deploy
 * Handles the deployment of a new instance based on the parameters provided via query strings.
 * It validates the required parameters, interacts with a node specific API to create the instance,
 * and updates the database with the new instance data. Error handling is included for validation
 * and remote request failures.
 *
 * @param {string} image - The Docker image name to deploy.
 * @param {string} [cmd] - Optional command to run in the container, passed as comma-separated values.
 * @param {string} [env] - Optional environment variables for the container, passed as comma-separated values.
 * @param {number} [memory] - Optional memory allocation for the container, specified in MB.
 * @param {number} [cpu] - Optional CPU share for the container.
 * @param {string} [ports] - Optional port mappings for the container, passed as comma-separated values in 'container:host' format.
 * @param {string} nodeId - Identifier for the node on which the instance will be deployed.
 * @param {string} name - Name of the instance.
 * @param {string} user - User identifier who is deploying the instance.
 * @returns {Response} Sends a 201 status with instance deployment details if successful, or an error status if deployment fails.
 */

router.get('/instances/deploy', async (req, res) => {
  const {
    image,
    memory,
    cpu,
    ports,
    nodeId,
    name,
    user
  } = req.query;

  if (!image || !memory || !cpu || !ports || !nodeId || !name || !user) return res.send('Missing parameters')

  const NodeId = nodeId;
  const Name = name;
  const Memory = memory ? parseInt(memory) * 1024 * 1024 : undefined;
  const Cpu = cpu ? parseInt(cpu) : undefined;
  const ExposedPorts = {};
  const PortBindings = {};

  let Node = await db.get(NodeId + '_node');
  if (!Node) return res.send('Invalid node');

  const NodeRemote = Node.address;
  const NodePort = Node.port;

  if (ports) {
    ports.split(',').forEach(portMapping => {
      const [containerPort, hostPort] = portMapping.split(':');
      const key = `${containerPort}/tcp`;
      ExposedPorts[key] = {};
      PortBindings[key] = [{ HostPort: hostPort }];
    });
  }

  const RequestData = {
    method: 'post',
    url: 'http://' + NodeRemote + ':' + NodePort + '/instances/create',
    auth: {
      username: 'kspanel',
      password: Node.apiKey
    },
    headers: { 
      'Content-Type': 'application/json'
    },
    data: {
      Name,
      Image: image,
      Memory,
      Cpu,
      ExposedPorts,
      PortBindings
    }
  };

  try {
    const response = await axios(RequestData);

    // Attempt to get the user's current server list
    const userId = user;
    const userServers = await db.get(`${userId}_instances`) || [];
    const globalServers = await db.get('instances') || [];

    // Append the new server ID to the user's server list
    userServers.push({
      Name: name,
      Node,
      ContainerId: response.data.containerId,
      VolumeId: response.data.volumeId,
      Memory,
      Cpu,
      ExposedPorts,
      PortBindings
    });

    globalServers.push({
      Name: name,
      Node,
      ContainerId: response.data.containerId,
      VolumeId: response.data.volumeId,
      Memory,
      Cpu,
      ExposedPorts,
      PortBindings
  });

    // Save the updated list back to the database
    await db.set(`${userId}_instances`, userServers);
    await db.set(`instances`, globalServers);

    // somewhatNotGlobalServerYetSlightlyGlobalIsThisGlobalOrNot this was called
    await db.set(`${response.data.containerId}_instance`, {
      Name: name,
      Node,
      ContainerId: response.data.containerId,
      VolumeId: response.data.volumeId,
      Memory,
      Cpu,
      ExposedPorts,
      PortBindings
    });

    res.status(201).json({
      Message: 'Container created successfully and added to user\'s servers',
      ContainerId: response.data.containerId,
      VolumeId: response.data.volumeId
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: 'Failed to create container',
      details: error ? error.data : 'No additional error info'
    });
  }
});

router.get("/admin/instances", isAdmin, async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 20;

  // Use pagination for instances
  const instancesResult = await getPaginatedInstances(page, pageSize);
  
  let images = (await db.get("images")) || [];
  let nodes = (await db.get("nodes")) || [];
  let users = (await db.get("users")) || [];

  // Use optimized batch operation for node status checks
  nodes = await checkMultipleNodesStatus(nodes);

  res.render("admin/instances", {
    req,
    user: req.user,
    instances: instancesResult.data,
    pagination: instancesResult.pagination,
    images,
    nodes,
    users,
  });
});

router.get("/admin/instances/:id/edit", isAdmin, async (req, res) => {
  const { id } = req.params;
  const instance = await db.get(id + "_instance");
  let users = (await db.get("users")) || [];
  let images = (await db.get("images")) || [];

  if (!instance) return res.redirect("/admin/instances");
  res.render("admin/instance_edit", {
    req,
    user: req.user,
    instance,
    images,
    users,
  });
});

router.get("/admin/instance/delete/:id", isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.redirect("/admin/instances");
    }

    const instance = await db.get(id + "_instance");
    if (!instance) {
      return res.status(404).send("Instance not found");
    }

    await deleteInstance(instance);
    logAudit(req.user.userId, req.user.username, "instance:delete", req.ip);
    res.redirect("/admin/instances");
  } catch (error) {
    log.error("Error in delete instance endpoint:", error);
    res.status(500).send("An error occurred while deleting the instance");
  }
});

router.get("/admin/instances/purge/all", isAdmin, async (req, res) => {
  try {
    const instances = (await db.get("instances")) || [];

    for (const instance of instances) {
      await deleteInstance(instance);
    }

    await db.delete("instances");
    res.redirect("/admin/instances");
  } catch (error) {
    log.error("Error in purge all instances endpoint:", error);
    res.status(500).send("An error occurred while purging all instances");
  }
});

router.post("/admin/instances/suspend/:id", isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.redirect("/admin/instances");
    }
    const instance = await db.get(id + "_instance");
    if (!instance) {
      return res.status(404).send("Instance not found");
    }

    instance.suspended = true;
    await db.set(id + "_instance", instance);
    let instances = (await db.get("instances")) || [];

    let instanceToSuspend = instances.find(
      (obj) => obj.ContainerId === instance.ContainerId
    );
    if (instanceToSuspend) {
      instanceToSuspend.suspended = true;
    }

    await db.set("instances", instances);

    // Invalidate cache after update
    invalidateCache("instances");
    invalidateCache(id + "_instance");

    logAudit(req.user.userId, req.user.username, "instance:suspend", req.ip);
    res.redirect("/admin/instances");
  } catch (error) {
    log.error("Error in suspend instance endpoint:", error);
    res.status(500).send("An error occurred while suspending the instance");
  }
});

router.post("/admin/instances/unsuspend/:id", isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.redirect("/admin/instances");
    }
    const instance = await db.get(id + "_instance");
    if (!instance) {
      return res.status(404).send("Instance not found");
    }

    instance.suspended = false;

    await db.set(id + "_instance", instance);

    let instances = (await db.get("instances")) || [];

    let instanceToUnsuspend = instances.find(
      (obj) => obj.ContainerId === instance.ContainerId
    );
    if (instanceToUnsuspend) {
      instanceToUnsuspend.suspended = false;
    }
    if (instanceToUnsuspend["suspended-flagg"]) {
      delete instanceToUnsuspend["suspended-flagg"];
    }

    await db.set("instances", instances);

    // Invalidate cache after update
    invalidateCache("instances");
    invalidateCache(id + "_instance");

    logAudit(req.user.userId, req.user.username, "instance:unsuspend", req.ip);

    res.redirect("/admin/instances");
  } catch (error) {
    log.error("Error in unsuspend instance endpoint:", error);
    res.status(500).send("An error occurred while unsuspending the instance");
  }
});

module.exports = router;
