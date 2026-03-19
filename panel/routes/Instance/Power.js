const express = require("express");
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
    let bodyData = {};
    if (action === "start" || action === "restart") {
      bodyData.startCode = instance.imageData?.Scripts || "";
    } else if (action === "stop") {
      bodyData.command = instance.StopCommand || "stop";
    }

    const authString = Buffer.from(`kspanel:${instance.Node.apiKey}`).toString("base64");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json().catch(() => ({}));

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
