const express = require("express");
const axios = require("axios");
const { db } = require("../../handlers/db.js");
const { logAudit } = require("../../handlers/auditLog.js");
const log = new (require("cat-loggr"))();
const { loadPlugins } = require("../../plugins/loadPls.js");
const {
  isUserAuthorizedForContainer,
  isInstanceSuspended,
} = require("../../utils/authHelper");
const path = require("path");
const fs = require("fs");

const { checkContainerState } = require("../../utils/checkstate.js");
const {
  prepareRequestData,
  updateDatabaseWithNewInstance,
} = require("./InstanceReDeploy.js");

const plugins = loadPlugins(path.join(__dirname, "../../plugins"));
const router = express.Router();

const allPluginData = Object.values(plugins).map((plugin) => plugin.config);

/**
 * GET /instance/:id/startup
 * Renders the instance startup page with the available alternative images.
 */
router.get("/instance/:id/startup", async (req, res) => {
  if (!req.user) return res.redirect("/");

  const { id } = req.params;

  if (!id) {
    return res.redirect("/instances");
  }

  try {
    const instance = await db.get(`${id}_instance`);
    if (!instance) {
      return res.redirect("../../instances");
    }

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

    // ======================== NEW: Load Variables from template.json (your real format) ========================
    let templateData = { Variables: {} };

    // Smart filename detection (works with your Paper example)
    let templateKey = "default";
    if (instance.imageData) {
      if (instance.imageData.meta && instance.imageData.meta.name) {
        templateKey = instance.imageData.meta.name;                    // "paper"
      } else if (instance.imageData.Image) {
        templateKey = instance.imageData.Image;
      } else if (instance.imageData.environment && instance.imageData.environment.docker_image) {
        templateKey = instance.imageData.environment.docker_image.split(":")[0];
      }
    }

    const cleanName = templateKey.replace(/[^a-zA-Z0-9._-]/g, "_") + ".json";
    const templatePath = path.join(__dirname, "../../templates", cleanName);

    if (fs.existsSync(templatePath)) {
      try {
        const rawTemplate = JSON.parse(fs.readFileSync(templatePath, "utf8"));
        log.info(`Loaded template.json: ${cleanName}`);

        // Convert your "variables" ARRAY to the object format EJS expects
        if (rawTemplate.variables && Array.isArray(rawTemplate.variables)) {
          rawTemplate.variables.forEach(v => {
            if (v.user_editable !== false) {   // only show editable ones
              templateData.Variables[v.id] = {
                type: v.type === "string" ? "text" : (v.type || "text"),
                name: v.name || v.id,           // nice label
                default: v.default || ""
              };
            }
          });
        }
      } catch (e) {
        log.error("Failed to parse template.json:", e);
      }
    }

    // Fallback to old imageData if template.json not found
    if (Object.keys(templateData.Variables).length === 0 && instance.imageData && instance.imageData.Variables) {
      templateData.Variables = instance.imageData.Variables;
    }

    instance.templateData = templateData;   // ← passed to EJS

    res.render("instance/startup.ejs", {
      req,
      user: req.user,
      instance,

      addons: {
        plugins: allPluginData,
      },
    });
  } catch (error) {
    log.error("Error fetching instance data:", error);
    res.status(500).json({
      error: "Failed to load instance data",
      details: error.message,
    });
  }
});

/**
 * POST /instances/startup/changevariable/:id
 * Handles the change of a specific environment variable for the instance.
 */
router.post("/instances/startup/changevariable/:id", async (req, res) => {
  if (!req.user) return res.redirect("/");

  const { id } = req.params;
  const { variable, value, user } = req.query;

  if (!id || !variable || !user) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const instance = await db.get(`${id}_instance`);
    if (!instance) {
      return res.status(404).json({ error: "Instance not found" });
    }

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

    const updatedEnv = instance.Env.map((envVar) => {
      const [key] = envVar.split("=");
      return key === variable ? `${key}=${value}` : envVar;
    });
    const updatedInstance = { ...instance, Env: updatedEnv };
    await db.set(`${id}_instance`, updatedInstance);

    logAudit(
      req.user.userId,
      req.user.username,
      "instance:variableChange",
      req.ip
    );
    res.json({ success: true });
  } catch (error) {
    log.error("Error updating environment variable:", error);
    res.status(500).json({
      error: "Failed to update environment variable",
      details: error.message,
    });
  }
});

/**
 * GET /instances/startup/changeimage/:id
 * Handles the change of the instance image based on the parameters provided via query strings.
 */
router.get("/instances/startup/changeimage/:id", async (req, res) => {
  if (!req.user) return res.redirect("/");

  const { id } = req.params;

  if (!id) {
    return res.redirect("/instances");
  }

  try {
    const instance = await db.get(`${id}_instance`);
    if (!instance) {
      return res.redirect("/instances");
    }

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

    const nodeId = instance.Node.id;
    const { image, user } = req.query;

    if (!image || !user || !nodeId) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const node = await db.get(`${nodeId}_node`);
    if (!node) {
      return res.status(400).json({ error: "Invalid node" });
    }

    const requestData = await prepareRequestData(
      image,
      instance.Memory,
      instance.Cpu,
      instance.Ports,
      instance.Name,
      node,
      id,
      instance.ContainerId,
      instance.Env
    );
    const response = await axios(requestData);

    await updateDatabaseWithNewInstance(
      response.data,
      user,
      node,
      instance.imageData.Image,
      instance.Memory,
      instance.Cpu,
      instance.Ports,
      instance.Primary,
      instance.Name,
      id,
      image,
      instance.imageData,
      instance.Env
    );

    checkContainerState(id, node.address, node.port, node.apiKey, user);
    logAudit(
      req.user.userId,
      req.user.username,
      "instance:imageChange",
      req.ip
    );
    res.status(201).redirect(`/instance/${id}/startup`);
  } catch (error) {
    log.error("Error changing instance image:", error);
    res.status(500).json({
      error: "Failed to change container image",
      details: error.response
        ? error.response.data
        : "No additional error info",
    });
  }
});

module.exports = router;
