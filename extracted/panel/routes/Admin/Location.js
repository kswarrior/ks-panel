const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const { db } = require("../../handlers/db.js");
const { logAudit } = require("../../handlers/auditLog.js");
const { isAdmin } = require("../../utils/isAdmin.js");
const { invalidateCache } = require("../../utils/dbHelper.js");

const log = new (require("cat-loggr"))();

// List all locations (paginated) - /admin/locations
router.get("/admin/locations", isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;

    const locationIds = (await db.get("locations")) || [];
    const total = locationIds.length;
    const totalPages = Math.ceil(total / pageSize);

    const paginatedIds = locationIds.slice((page - 1) * pageSize, page * pageSize);

    // Count nodes per location (only for displayed locations)
    const nodeSet = {};
    paginatedIds.forEach((locId) => {
      nodeSet[locId] = 0;
    });

    const allNodes = (await db.get("nodes")) || [];
    for (const nodeId of allNodes) {
      const node = await db.get(nodeId + "_node");
      if (node?.location && nodeSet[node.location] !== undefined) {
        nodeSet[node.location]++;
      }
    }

    // Load full location objects
    const locations = [];
    for (const locId of paginatedIds) {
      const loc = await db.get(locId + "_location");
      if (loc) {
        locations.push(loc);
      }
    }

    res.render("admin/locations", {
      req,
      user: req.user,
      locations,
      nodeSet,
      pagination: {
        currentPage: page,
        totalPages,
        pageSize,
        total,
      },
    });
  } catch (err) {
    log.error("Error fetching locations list:", err);
    res.status(500).render("error", { message: "Failed to load locations" });
  }
});

// Create new location - POST /locations/create
router.post("/locations/create", isAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Location name is required" });
    }

    const location = {
      id: uuidv4(),
      name: name.trim(),
      createdAt: new Date().toISOString(), // optional but useful
    };

    await db.set(`${location.id}_location`, location);

    const locations = (await db.get("locations")) || [];
    locations.push(location.id);
    await db.set("locations", locations);

    invalidateCache("locations");

    logAudit(req.user.userId, req.user.username, "location:create", req.ip);

    res.status(201).json(location);
  } catch (err) {
    log.error("Error creating location:", err);
    res.status(500).json({ error: "Failed to create location" });
  }
});

// Delete location - POST /locations/delete
router.post("/locations/delete", isAdmin, async (req, res) => {
  try {
    const { locationId } = req.body;

    if (!locationId) {
      return res.status(400).json({ error: "locationId is required" });
    }

    const locations = (await db.get("locations")) || [];
    const locationExists = locations.includes(locationId);

    if (!locationExists) {
      return res.status(404).json({ error: "Location not found" });
    }

    // Check if any nodes are using this location
    const nodes = (await db.get("nodes")) || [];
    let nodeCount = 0;

    for (const nodeId of nodes) {
      const node = await db.get(`${nodeId}_node`);
      if (node?.location === locationId) {
        nodeCount++;
      }
    }

    if (nodeCount > 0) {
      return res.status(400).json({
        error: `Cannot delete: ${nodeCount} node${nodeCount === 1 ? "" : "s"} assigned to this location`,
      });
    }

    // Safe to delete
    await db.delete(`${locationId}_location`);

    const updatedLocations = locations.filter((id) => id !== locationId);
    await db.set("locations", updatedLocations);

    invalidateCache("locations");

    logAudit(req.user.userId, req.user.username, "location:delete", req.ip);

    res.json({ success: true });
  } catch (err) {
    log.error("Error deleting location:", err);
    res.status(500).json({ error: "Failed to delete location" });
  }
});

// View single location details - GET /admin/location/:id
router.get("/admin/location/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const location = await db.get(`${id}_location`);
    if (!location) {
      return res.status(404).render("error", { message: "Location not found" });
    }

    // Count assigned nodes
    const nodes = (await db.get("nodes")) || [];
    let nodeCount = 0;

    for (const nodeId of nodes) {
      const node = await db.get(`${nodeId}_node`);
      if (node?.location === id) {
        nodeCount++;
      }
    }

    res.render("admin/location", {
      req,
      user: req.user,
      location,
      nodeCount,
    });
  } catch (err) {
    log.error("Error fetching location details:", err);
    res.status(500).render("error", { message: "Failed to load location" });
  }
});

// Update location name - POST /location/:id
router.post("/location/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const location = await db.get(`${id}_location`);
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    location.name = name.trim();
    // Optional: update timestamp
    location.updatedAt = new Date().toISOString();

    await db.set(`${id}_location`, location);

    invalidateCache("locations");

    logAudit(req.user.userId, req.user.username, "location:update", req.ip);

    res.json(location);
  } catch (err) {
    log.error("Error updating location:", err);
    res.status(500).json({ error: "Failed to update location" });
  }
});

module.exports = router;
