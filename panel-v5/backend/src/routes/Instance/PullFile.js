const express = require("express");
const router = express.Router();
const axios = require("axios");
const { db } = require("../../handlers/db.js");
const {
  isUserAuthorizedForContainer,
  isInstanceSuspended,
} = require("../../utils/authHelper");
const log = new (require("cat-loggr"))();

router.post("/instance/:id/files/pull", async (req, res) => {
  if (!req.user) return res.status(401).send("Authentication required");

  const { id } = req.params;
  const { url, filename } = req.body;
  const subPath = req.query.path || "";

  if (!url) return res.status(400).send("URL is required");

  const instance = await db.get(id + "_instance");
  if (!instance) return res.status(404).send("Instance not found");

  const isAuthorized = await isUserAuthorizedForContainer(req.user.userId, instance.Id);
  if (!isAuthorized) return res.status(403).send("Unauthorized");

  const suspended = await isInstanceSuspended(req.user.userId, instance, id);
  if (suspended) return res.render("instance/suspended", { req, user: req.user });

  const apiUrl = `http://${instance.Node.address}:${instance.Node.port}/fs/${instance.VolumeId}/files/pull?path=${encodeURIComponent(subPath)}`;

  try {
    const response = await axios.post(apiUrl, { url, filename: filename || null }, {
      auth: { username: "kspanel", password: instance.Node.apiKey },
    });
    res.json({ message: "File pulled from URL successfully" });
  } catch (error) {
    log.error("Pull error:", error);
    res.status(500).send("Failed to pull file from URL");
  }
});

module.exports = router;
