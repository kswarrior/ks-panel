#!/usr/bin/env node

const { Command } = require("commander");
const pkg = require("../../package.json");

const program = new Command();

function launch(options = {}) {
  if (options.port) {
    process.env.PORT = String(options.port);
  }

  process.env.KSPANEL_CLI_LAUNCH = "true";
  require("../../index.js");
}

program
  .name("kspanel")
  .version(pkg.version)
  .description("Command Line Interface for the KS Panel");

program
  .command("launch", { isDefault: true })
  .description("Launch the KS Panel server")
  .option("--port <number>", "Port to listen on")
  .action(launch);

program
  .command("seed")
  .description("Seeds the images to the database")
  .action(() => {
    require("../../exec/seed.js");
  });

program
  .command("create:user")
  .description("Creates a new Admin user")
  .action(() => {
    require("../../exec/createUser.js");
  });

program.parse(process.argv);
