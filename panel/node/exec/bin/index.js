const { config, rootDir, isPkg, paths } = require("../utils/config.js");
#!/usr/bin/env node

const { Command } = require("commander");
const program = new Command();

program
  .version("0.1.0-beta6")
  .description("Command Line Interface for the KS Panel")
  .option("-p, --port <number>", "Port to run the panel on")
  .action((options) => {
    if (options.port) {
      process.env.PORT = options.port;
    }
    require("../../index.js");
  });

program
  .command("seed")
  .description("Seeds the images to the database")
  .action(() => {
    require("../seed.js");
  });

program
  .command("createUser")
  .description("Creates a new Admin user")
  .action(() => {
    require("../createUser.js");
  });

program
  .command("create:user")
  .description("Creates a new Admin user")
  .action(() => {
    require("../createUser.js");
  });

program.parse(process.argv);
