
const program = require('commander'),
      colors = require('colors'),
      fs = require('fs'),
      packageJson = require('./package.json');

const actions = require('./actions');

program
  .version(packageJson.version)
  .description(packageJson.description);

program
  .command('init <name>')
  .alias('i')
  .description('Initialize a new immigrant project')
  .action(actions.init);

program
  .command('create <name>')
  .alias('c')
  .description('Create a new migration')
  .action(actions.create);

program
  .command('baseline <env>')
  .alias('b')
  .description('Takes a baseline snapshot of a database')
  .action(actions.baseline);

program
  .command('query <env>')
  .alias('q')
  .description('Query the current version of a database')
  .action(actions.query);

program
  .command('migrate <env> <ver>')
  .alias('m')
  .description('Migrate a database up to a specific version')
  .action(actions.migrate);

program
  .command('rollback <env> <ver>')
  .alias('r')
  .description('Roll a database back to a specific version')
  .action(actions.rollback);


program.parse(process.argv);
