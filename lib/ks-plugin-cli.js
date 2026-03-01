#!/usr/bin/env node

const commander = require('commander');
const path = require('path');
const pluginManager = require('../plugins/pluginManager'); // Adjust path

const program = new commander.Command();

program
  .command('install <ksppPath>')
  .description('Install a .kspp plugin')
  .action(async (ksppPath) => {
    try {
      await pluginManager.installFromKspp(path.resolve(ksppPath));
      console.log('Plugin installed successfully.');
    } catch (err) {
      console.error('Error:', err.message);
    }
  });

program
  .command('uninstall <name>')
  .description('Uninstall a plugin by name')
  .action(async (name) => {
    try {
      await pluginManager.uninstall(name);
      console.log('Plugin uninstalled successfully.');
    } catch (err) {
      console.error('Error:', err.message);
    }
  });

program
  .command('list')
  .description('List installed plugins')
  .action(() => {
    const plugins = pluginManager.listPlugins();
    console.log(plugins.join('\n') || 'No plugins installed.');
  });

program.parse(process.argv);
