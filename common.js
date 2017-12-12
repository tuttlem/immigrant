
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const _ = require('lodash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const log = require('./log');

const readdirAsync = promisify(fs.readdir),
  mkdirAsync = promisify(fs.mkdir),
  writeFileAsync = promisify(fs.writeFile),
  readFileAsync = promisify(fs.readFile);

function dbForEnvironment(env) {
  
  try {
  
    const folder = process.cwd();
    const conf = require(`${folder}/config.json`);

    if (!conf[env]) {
      throw new Error(`Could not find the environment "${env}"`);
    }

    let sequelize = new Sequelize(conf[env], { logging: false });

    return Promise.resolve(sequelize);
  
  } catch (e) {
    return Promise.reject(e);
  }

}

function getCurrentVersion(db, folder) {

  const {MigrationHistory} = require('./models')(db);

  return db.sync()
    .then(() => {

      return MigrationHistory.findAll({
        order: [['executed', 'DESC']],
        limit: 1
      }).then(async hs => {

        if (hs.length == 0) {
          return null;
        }

        let localVersions = await getLocalVersions(folder);
        let lastAction = hs[0];

        if (lastAction.direction == 'migrate') {
          return lastAction.name;
        } else if (lastAction.direction == 'rollback') {
          return localVersions[
            localVersions.indexOf(lastAction.name) - 1
          ];
        }

        return null;

      });

    });

}

async function getDirection(folder, from, to) {

  let localVersions = await getLocalVersions(folder);
  let fromIndex = 0;
  let toIndex = 0;

  if (from != null) {
    fromIndex = localVersions.indexOf(from);
  }

  if (to == '*') {
    toIndex = localVersions.length - 1;
  } else {
    toIndex = localVersions.indexOf(to);
  }

  return Math.sign(toIndex - fromIndex);

}

async function getLocalVersions(folder) {

  let ups = await readdirAsync(`${folder}/up`);
  let vers = _.map(ups, u => path.basename(u, '.sql'));

  return [ null ].concat(_.sortBy(vers, v => { return parseInt(v.split('-')[0]); }));

}

async function getVersionRange(folder, from, to) {

  let localVersions = await getLocalVersions(folder);
  let fromIndex = 0;
  let toIndex = 0;

//  log.mute(localVersions);

  if (from != null) {
    fromIndex = localVersions.indexOf(from);
  }

  if (to == '*') {
    toIndex = localVersions.length - 1;
  } else {
    toIndex = localVersions.indexOf(to);
  }

  log.mute(`Versions ${from} to ${to}`);
  log.mute(`Index range ${fromIndex} to ${toIndex}`);

  if (fromIndex < toIndex) {
    /* migrating forward, so skip the first migration */
    
    return localVersions.splice(fromIndex + 1, toIndex - fromIndex);

  } else if (fromIndex > toIndex) {
    /* rolling back, so we reverse the array and avoid rolling back the end */
    
    return _.reverse(localVersions.splice(toIndex + 1, fromIndex - toIndex + 1));

  } else {
    return [];
  }

}


async function executeScripts(db, folder, versions, mode) {

//  let versions = await getVersionRange(folder, from, to);
  const {MigrationHistory} = require('./models')(db);

  let subFolder = mode == 'migrate' ? 'up' : 'down';

  return await db.transaction(async t => {

    let doExecute = (versions) => {

      if (versions.length == 0) {
        return Promise.resolve(true);
      }

      let version = versions[0];
      if (version != null) {

        let scriptFile = `${folder}/${subFolder}/${version}.sql`;
        return readFileAsync(scriptFile)
          .then(scriptText => {

            log.info(`Executing ${scriptFile}`);

            scriptText = scriptText.toString();
            
            return db.query(scriptText, { raw: true, type: 'SELECT' })
              .then(() => {

                let history = MigrationHistory.build({
                  name: version,
                  direction: mode,
                  executed: new Date()
                });

                return history.save();

              })
              .then(() => {

                log.success(`Successfully executed ${scriptFile}`);
                return doExecute(versions.splice(1));

              });

          });

      } else {
        return doExecute(versions.splice(1));
      }

    };

    return doExecute(versions);

    /*
    _.forEach(versions, async version => {

      if (version != null) {

        let scriptFile = `${folder}/${subFolder}/${version}.sql`;
        let scriptText = await readFileAsync(scriptFile);

        log.info(`Executing ${scriptFile}`);

        try {

          scriptText = scriptText.toString();
          await db.query(scriptText, { raw: true, type: 'SELECT' });

          let history = MigrationHistory.build({
            name: version,
            direction: mode,
            executed: new Date()
          });

          await history.save();

          log.success(`Successfully executed ${scriptFile}`);
        } catch (e) {
          log.error(`Failed to execute ${scriptFile}: ${e.message}`);
          throw e;
        }
        

      }
    });
    */

  });

}

module.exports = {
  dbForEnvironment,
  getCurrentVersion,
  getDirection,
  getLocalVersions,
  getVersionRange,
  executeScripts
};
