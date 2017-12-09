
const program = require('commander'),
      colors = require('colors'),
      fs = require('fs'),
      packageJson = require('./package.json');

const actions = require('./actions');

program
  .version(packageJson.version)
  .description(packageJson.description);

program
  .command('init')
  .alias('i')
  .description('Initialize a new immigrant project')
  .action(actions.init);

program.parse(process.argv);
