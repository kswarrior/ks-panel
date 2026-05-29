const express = require("express");
const router = express.Router();
const axios = require("axios");
const { db } = require("../../handlers/db.js");
const {
  isUserAuthorizedForContainer,
  isInstanceSuspended,
} = require("../../utils/authHelper");
const log = new (require("cat-loggr"))();

router.get("/instance/:id/files/download/:file", async (req, res) => {
  if (!req.user) return res.status(401).send("Authentication required");

  const { id, file } = req.params;
  const subPath = req.query.path || "";

  const instance = await db.get(id + "_instance");
  if (!instance) return res.status(404).send("Instance not found");

  const isAuthorized = await isUserAuthorizedForContainer(req.user.userId, instance.Id);
  if (!isAuthorized) return res.status(403).send("Unauthorized");

  const suspended = await isInstanceSuspended(req.user.userId, instance, id);
  if (suspended) return res.render("instance/suspended", { req, user: req.user });

  const apiUrl = `http://${instance.Node.address}:${instance.Node.port}/fs/${instance.VolumeId}/files/download/${encodeURIComponent(file)}?path=${encodeURIComponent(subPath)}`;

  try {
    const response = await axios({
      url: apiUrl,
      method: "GET",
      responseType: "stream",
      auth: { username: "kspanel", password: instance.Node.apiKey },
    });

    res.setHeader("Content-Disposition", `attachment; filename="${file}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    response.data.pipe(res);
  } catch (error) {
    log.error("Download error:", error);
    res.status(500).send("Failed to download file");
  }
});

module.exports = router;
