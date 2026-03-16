const express = require("express");
const axios = require("axios");
const { db } = require("../../handlers/db.js");
const {
  isUserAuthorizedForContainer,
  isInstanceSuspended,
} = require("../../utils/authHelper");

const router = express.Router();
const log = new (require("cat-loggr"))();

router.post("/instance/:id/power", async (req, res) => {
  if (!req.user) return res.redirect("/");
  const { id } = req.params;
  const { action } = req.body;

  const instance = await db.get(`${id}_instance`);
  if (!instance || !id) return res.redirect("../instances");

  const isAuthorized = await isUserAuthorizedForContainer(req.user.userId, instance.Id);
  if (!isAuthorized) return res.status(403).send("Unauthorized");

  const suspended = await isInstanceSuspended(req.user.userId, instance, id);
  if (suspended) return res.render("instance/suspended", { req, user: req.user });

  const node = instance.Node;
  const baseUrl = `http://${node.address}:${node.port}/instances/${instance.ContainerId}`;

  try {
    let responseData;

    if (action === "start") {
      const resp = await axios.post(`${baseUrl}/start`, {}, {
        auth: { username: "kspanel", password: node.apiKey },
      });
      responseData = resp.data;

    } else if (action === "stop") {
      const stopCommand = instance.StopCommand || "stop";
      const resp = await axios.post(`${baseUrl}/runcode`, { command: stopCommand }, {
        auth: { username: "kspanel", password: node.apiKey },
      });
      responseData = resp.data;

    } else if (action === "restart") {
      const resp = await axios.post(`${baseUrl}/restart`, {}, {
        auth: { username: "kspanel", password: node.apiKey },
      });
      responseData = resp.data;
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    res.json(responseData);
  } catch (error) {
    log.error("Power error:", error.response?.data || error.message);
    res.status(500).json({ error: "Node communication failed" });
  }
});

module.exports = router;
