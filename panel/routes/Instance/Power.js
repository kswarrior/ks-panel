const express = require("express");
const axios = require("axios");
const { db } = require("../../handlers/db.js");
const fs = require("fs");
const path = require("path");
const {
  isUserAuthorizedForContainer,
  isInstanceSuspended,
} = require("../../utils/authHelper");

const router = express.Router();

router.post("/instance/:id/power", async (req, res) => {
  if (!req.user) return res.redirect("/");
  const { id } = req.params;
  const { action } = req.body; // "start" or "stop"
  const instance = await db.get(`${id}_instance`);

  if (!instance || !id) return res.redirect("../instances");

  const isAuthorized = await isUserAuthorizedForContainer(req.user.userId, instance.Id);
  if (!isAuthorized) return res.status(403).send("Unauthorized");

  const suspended = await isInstanceSuspended(req.user.userId, instance, id);
  if (suspended) return res.render("instance/suspended", { req, user: req.user });

  // Load template.json
  const instanceDir = path.join(__dirname, "../../../database/instances", instance.Id);
  let template;
  try {
    const templatePath = path.join(instanceDir, "template.json");
    template = JSON.parse(fs.readFileSync(templatePath, "utf8"));
  } catch (e) {
    return res.status(500).json({ error: "template.json not found" });
  }

  const node = instance.Node;
  const baseUrl = `http://${node.address}:${node.port}/instances/${instance.ContainerId}`;

  try {
    let responseData;
    if (action === "start") {
      // Take start code from template.json and send to Wings runcode
      const startPayload = {
        command: template.startupCommand || template.startCode || "start", // use whatever key you have in your templates
        env: template.userVariables || {},
      };
      const resp = await axios.post(`${baseUrl}/runcode`, startPayload, {
        auth: { username: "kspanel", password: node.apiKey },
      });
      responseData = resp.data;
    } else if (action === "stop") {
      const stopPayload = { command: template.stopCommand || instance.StopCommand || "stop" };
      const resp = await axios.post(`${baseUrl}/stop`, stopPayload, {
        auth: { username: "kspanel", password: node.apiKey },
      });
      responseData = resp.data;
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    res.json(responseData);
  } catch (error) {
    log.error("Power error:", error);
    res.status(500).json({ error: "Node communication failed" });
  }
});

module.exports = router;
