const express = require("express");
const { db } = require("../../handlers/db.js"); // ← ADD THIS if missing
const {
  isUserAuthorizedForContainer,
  isInstanceSuspended,
} = require("../../utils/authHelper");

const router = express.Router();

router.post("/instance/:id/power", async (req, res) => {
  if (!req.user) return res.redirect("/");
  const { id } = req.params;
  const { action } = req.body;

  if (!["start", "restart", "stop"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  const instance = await db.get(id + "_instance");
  if (!instance || !id) return res.redirect("../instances");

  const isAuthorized = await isUserAuthorizedForContainer(
    req.user.userId,
    instance.Id
  );
  if (!isAuthorized) {
    return res.status(403).json({ message: "Unauthorized access to this instance." });
  }

  const suspended = await isInstanceSuspended(req.user.userId, instance, id);
  if (suspended === true) {
    return res.render("instance/suspended", { req, user: req.user });
  }

  const baseUrl = `http://${instance.Node.address}:${instance.Node.port}/instances/${instance.ContainerId}`;
  const url = `${baseUrl}/${action}`;

  try {
    // Build body object with exact property names Wings expects
    let bodyPayload = {};
    
    if (action === "start" || action === "restart") {
      // Wings expects: req.body.startCode
      bodyPayload.startCode = instance.imageData?.Scripts || instance.imageData?.startup || "";
    } else if (action === "stop") {
      // Wings expects: req.body.command
      bodyPayload.command = instance.StopCommand || "stop";
    }

    const authString = Buffer.from(`kspanel:${instance.Node.apiKey}`).toString("base64");

    // Explicitly set Content-Type and send JSON
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${authString}`,
      },
      body: JSON.stringify(bodyPayload),
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    let data = {};
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(data.message || `Node error (${response.status})`);
    }

    res.json(data);
  } catch (error) {
    console.error("Power error:", error.message);
    res.status(500).json({ message: error.message || "Connection to node failed." });
  }
});

module.exports = router;
