const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { db } = require("../../handlers/db.js");
const { logAudit } = require("../../handlers/auditLog.js");
const { isAdmin } = require("../../utils/isAdmin.js");
const { invalidateCache } = require("../../utils/dbHelper.js");
const log = new (require("cat-loggr"))();

router.get("/admin/locations", isAdmin, async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 20;

  let locationIds = await db.get("locations") || [];
  const total = locationIds.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagination = {
    currentPage: page,
    totalPages,
    pageSize,
    total
  };

  locationIds = locationIds.slice((page - 1) * pageSize, page * pageSize);

  let nodes = await db.get("nodes") || [];
  let nodeSet = {};
  locationIds.forEach(function (locId) {
    nodeSet[locId] = 0;
  });

  for (const nodeId of nodes) {
    const node = await db.get(nodeId + "_node");
    if (node && node.location && nodeSet[node.location] !== undefined) {
      nodeSet[node.location]++;
    }
  }

  let locations = [];
  for (const locId of locationIds) {
    const loc = await db.get(locId + "_location");
    if (loc) locations.push(loc);
  }

  res.render("admin/locations", {
    req,
    user: req.user,
    locations,
    nodeSet,
    pagination,
  });
});

router.post("/locations/create", isAdmin, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).send("Missing name.");
  }

  const location = {
    id: uuidv4(),
    name,
  };

  await db.set(location.id + "_location", location);

  const locations = (await db.get("locations")) || [];
  locations.push(location.id);
  await db.set("locations", locations);

  invalidateCache("locations");

  logAudit(req.user.userId, req.user.username, "location:create", req.ip);
  res.status(201).json(location);
});

router.post("/locations/delete", isAdmin, async (req, res) => {
  const { locationId } = req.body;
  if (!locationId) {
    return res.status(400).json({ error: "Missing locationId" });
  }

  try {
    const locations = (await db.get("locations")) || [];
    let foundLocation = null;

    for (const id of locations) {
      const loc = await db.get(id + "_location");
      if (loc && loc.id === locationId) {
        foundLocation = loc;
        break;
      }
    }

    if (!foundLocation) {
      return res.status(404).json({ error: "Location not found" });
    }

    const location = foundLocation;
    const nodes = (await db.get("nodes")) || [];
    let nodeCount = 0;

    for (const nodeId of nodes) {
      const node = await db.get(nodeId + "_node");
      if (node && node.location === location.id) {
        nodeCount++;
      }
    }

    if (nodeCount > 0) {
      return res.status(400).json({ error: "There are nodes in the location" });
    }

    await db.delete(location.id + "_location");
    const remainingLocations = locations.filter((id) => id !== location.id);
    await db.set("locations", remainingLocations);

    invalidateCache("locations");

    logAudit(req.user.userId, req.user.username, "location:delete", req.ip);
    res.status(200).json({ success: true });
  } catch (error) {
    log.error("Error deleting location:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/location/:id", isAdmin, async (req, res) => {
  const { id } = req.params;

  const location = await db.get(id + "_location");
  if (!location) {
    return res.status(404).send("Location not found");
  }

  const nodes = (await db.get("nodes")) || [];
  let nodeCount = 0;

  for (const nodeId of nodes) {
    const node = await db.get(nodeId + "_node");
    if (node && node.location === id) {
      nodeCount++;
    }
  }

  res.render("admin/location", {
    req,
    user: req.user,
    location,
    nodeCount,
  });
});

router.post("/location/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const location = await db.get(id + "_location");
  if (!location) {
    return res.status(404).json({ error: "Location not found" });
  }

  location.name = name;
  await db.set(id + "_location", location);

  invalidateCache("locations");

  logAudit(req.user.userId, req.user.username, "location:update", req.ip);
  res.status(200).json(location);
});

module.exports = router;
