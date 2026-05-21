const commander = require('commander');
const path = require('path');
const pluginManager = require('../plugins/pluginManager.js');

const program = new commander.Command();

program
  .command('install <ksppPath>')
  .description('Install a .kspp plugin')
  .action(async (ksppPath) => {
    try {
      await pluginManager.installFromKspp(path.resolve(ksppPath));
      console.log('Installed successfully. Restart panel if needed.');
    } catch (err) {
      console.error('Install error:', err.message);
    }
  });

program
  .command('uninstall <name>')
  .description('Uninstall a plugin')
  .action(async (name) => {
    try {
      await pluginManager.uninstall(name);
      console.log('Uninstalled successfully. Restart panel if needed.');
    } catch (err) {
      console.error('Uninstall error:', err.message);
    }
  });

program
  .command('list')
  .description('List plugins')
  .action(() => {
    const plugins = pluginManager.listPlugins();
    console.log(plugins.join('\n') || 'No plugins.');
  });

program.parse(process.argv);
