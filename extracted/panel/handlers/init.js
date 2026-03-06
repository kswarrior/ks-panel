const { db } = require("../handlers/db.js");
const config = require("../config.json");
const { v4: uuidv4 } = require("uuid");
const log = new (require("cat-loggr"))();

async function init() {
  const ksPanel = await db.get("ks_panel_instance");

  if (!ksPanel) {
    log.init("This is probably your first time starting KS Panel, welcome!");

    const errorMessages = [];

    const imageCheck = await db.get("images");
    const userCheck = await db.get("users");

    // Check if seed was run
    if (!imageCheck) {
      errorMessages.push(
        "Before starting KS Panel for the first time, you didn't run the seed command!"
      );
      errorMessages.push("Please run: npm run seed");
    }

    // Check if user exists
    if (!userCheck) {
      errorMessages.push(
        "If you didn't do it already, create a user for yourself: npm run createUser"
      );
    }

    // Stop if errors exist
    if (errorMessages.length > 0) {
      errorMessages.forEach((errorMsg) => log.error(errorMsg));
      process.exit(1);
    }

    // Generate new panel instance
    const panelId = uuidv4();
    const setupTime = Date.now();

    const info = {
      panelId: panelId,
      setupTime: setupTime,
      originalVersion: config.version,
    };

    await db.set("ks_panel_instance", info);

    log.info("Initialized KS Panel with ID: " + panelId);
  }

  log.info("KS Panel init complete!");
}

module.exports = { init };
