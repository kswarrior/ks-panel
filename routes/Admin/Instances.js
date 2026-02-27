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

/**
 * GET /instances/deploy
 * Handles the deployment of a new instance based on the parameters provided via query strings.
 */
router.get("/instances/deploy", isAdmin, async (req, res) => {
  const {
    image,
    imagename,
    memory,
    cpu,
    disk,
    ports,
    nodeId,
    name,
    user,
    primary,
    variables,
  } = req.query;
  if (
    !image ||
    !memory ||
    !cpu ||
    !disk ||
    !ports ||
    !nodeId ||
    !name ||
    !user ||
    !primary
  ) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const Id = uuid().split("-")[0];
    const node = await db.get(`${nodeId}_node`);
    if (!node) {
      return res.status(400).json({ error: "Invalid node" });
    }

    const requestData = await prepareRequestData(
      image,
      memory,
      cpu,
      disk,
      ports,
      name,
      node,
      Id,
      variables,
      imagename
    );
    const response = await axios(requestData);

    await updateDatabaseWithNewInstance(
      response.data,
      user,
      node,
      image,
      memory,
      cpu,
      disk,
      ports,
      primary,
      name,
      Id,
      imagename
    );

    // Start the state checking process
    checkContainerState(Id, node.address, node.port, node.apiKey, user);

    logAudit(req.user.userId, req.user.username, "instance:create", req.ip);
    res.status(201).json({
      message:
        "Container creation initiated. State will be updated asynchronously.",
      volumeId: Id,
      state: "INSTALLING",
    });
  } catch (error) {
    log.error("Error deploying instance:", error);
    res.status(500).json({
      error: "Failed to create container",
      details: error.response
        ? error.response.data
        : "No additional error info",
    });
  }
});

async function prepareRequestData(
  image,
  memory,
  cpu,
  disk,
  ports,
  name,
  node,
  Id,
  variables,
  imagename
) {
  const rawImages = await db.get("images");
  const imageData = rawImages.find((i) => i.Name === imagename);

  const requestData = {
    method: "post",
    url: `http://${node.address}:${node.port}/instances/create`,
    auth: {
      username: "kspanel",
      password: node.apiKey,
    },
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      Name: name,
      Id,
      Image: image,
      Env: imageData ? imageData.Env : undefined,
      Scripts: imageData ? imageData.Scripts : undefined,
      Memory: memory ? parseInt(memory) : undefined,
      Cpu: cpu ? parseInt(cpu) : undefined,
      Disk: disk ? parseInt(disk) : undefined,
      ExposedPorts: {},
      PortBindings: {},
      variables,
      AltImages: imageData ? imageData.AltImages : [],
      StopCommand: imageData ? imageData.StopCommand : undefined,
      imageData,
    },
  };

  if (ports) {
    ports.split(",").forEach((portMapping) => {
      const [containerPort, hostPort] = portMapping.split(":");

      // Adds support for TCP
      const tcpKey = `${containerPort}/tcp`;
      if (!requestData.data.ExposedPorts[tcpKey]) {
        requestData.data.ExposedPorts[tcpKey] = {};
      }

      if (!requestData.data.PortBindings[tcpKey]) {
        requestData.data.PortBindings[tcpKey] = [{ HostPort: hostPort }];
      }

      // Adds support for UDP
      const udpKey = `${containerPort}/udp`;
      if (!requestData.data.ExposedPorts[udpKey]) {
        requestData.data.ExposedPorts[udpKey] = {};
      }

      if (!requestData.data.PortBindings[udpKey]) {
        requestData.data.PortBindings[udpKey] = [{ HostPort: hostPort }];
      }
    });
  }

  return requestData;
}

async function updateDatabaseWithNewInstance(
  responseData,
  userId,
  node,
  image,
  memory,
  cpu,
  disk,
  ports,
  primary,
  name,
  Id,
  imagename
) {
  const rawImages = await db.get("images");
  const imageData = rawImages.find((i) => i.Name === imagename);

  let altImages = imageData ? imageData.AltImages : [];

  const instanceData = {
    Name: name,
    Id,
    Node: node,
    User: userId,
    InternalState: "INSTALLING",
    ContainerId: responseData.containerId,
    VolumeId: Id,
    Memory: parseInt(memory),
    Cpu: parseInt(cpu),
    Disk: disk ? parseInt(disk) : 0,
    Ports: ports,
    Primary: primary,
    Image: image,
    AltImages: altImages,
    StopCommand: imageData ? imageData.StopCommand : undefined,
    imageData,
    Env: responseData.Env,
  };

  const userInstances = (await db.get(`${userId}_instances`)) || [];
  userInstances.push(instanceData);
  await db.set(`${userId}_instances`, userInstances);

  const globalInstances = (await db.get("instances")) || [];
  globalInstances.push(instanceData);
  await db.set("instances", globalInstances);

  await db.set(`${Id}_instance`, instanceData);
}

module.exports = router;
