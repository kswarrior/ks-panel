const express = require("express");
const router = express.Router();
const { db } = require("../../handlers/db.js");
const {
  isUserAuthorizedForContainer,
  isInstanceSuspended,
} = require("../../utils/authHelper");
const { loadPlugins } = require("../../plugins/loadPls.js");
const path = require("path");
const { fetchFiles, fetchFileContent } = require("../../utils/fileHelper");
const { isAuthenticated } = require("../../handlers/auth.js");

const plugins = loadPlugins(path.join(__dirname, "../../plugins"));

router.get("/instances", isAuthenticated, async (req, res) => {
  if (!req.user) return res.redirect("/");
  let instances = [];

  if (req.query.see === "other") {
    let allInstances = (await db.get("instances")) || [];
    instances = allInstances.filter(
      (instance) => instance.User !== req.user.userId
    );
  } else {
    const userId = req.user.userId;
    const users = (await db.get("users")) || [];
    const authenticatedUser = users.find((user) => user.userId === userId);
    instances = (await db.get(req.user.userId + "_instances")) || [];
    const subUserInstances = authenticatedUser.accessTo || [];
    for (const instanceId of subUserInstances) {
      const instanceData = await db.get(`${instanceId}_instance`);
      if (instanceData) {
        instances.push(instanceData);
      }
    }
  }

  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json(instances);
  }

  res.sendFile(path.join(__dirname, "../../public/dist/index.html"));
});

router.get("/instance/:id", async (req, res) => {
  if (!req.user) return res.redirect("/");

  const { id } = req.params;
  if (!id) return res.redirect("/");

  let instance = await db.get(id + "_instance");
  if (!instance) return res.redirect("../instances");

  const isAuthorized = await isUserAuthorizedForContainer(
    req.user.userId,
    instance.Id
  );
  if (!isAuthorized) {
    return res.status(403).send("Unauthorized access to this instance.");
  }

  const suspended = await isInstanceSuspended(req.user.userId, instance, id);
  if (suspended === true) {
    return res.render("instance/suspended", { req, user: req.user });
  }

  if (instance.InternalState !== "READY" && instance.InternalState !== "STOPPED") {
  return res.redirect("/instances?err=NOTACTIVEYET");
  }

  const config = require("../../config.json");
  const { port, domain } = config;

  const allPluginData = Object.values(plugins).map((plugin) => plugin.config);
  const files = await fetchFiles(instance, "");


  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({
      ContainerId: instance.ContainerId,
      instance,
      port,
      domain,
      files,
      addons: {
        plugins: allPluginData,
      },
    });
  }

  res.sendFile(path.join(__dirname, "../../public/dist/index.html"));
});

module.exports = router;
