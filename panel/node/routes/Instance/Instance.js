const express = require("express");
const router = express.Router();
const { db } = require("../../handlers/db.js");
const { config, rootDir, isPkg } = require("../../utils/config.js");
const { loadPlugins } = require("../../plugins/loadPls.js");

const pluginsDir = isPkg ? path.resolve(rootDir, "database/plugins") : path.join(__dirname, "../../plugins");
const plugins = loadPlugins(pluginsDir);

// ... (rest of the file remains similar but I need to be careful not to break it)
