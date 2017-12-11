
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

function getCurrentVersion(db) {

  const {MigrationHistory} = require('./models')(db);

  return db.sync()
    .then(() => {

      return MigrationHistory.findAll({
        where: { direction: { [Op.eq]: 'migrate' } },
        order: [['executed', 'DESC']],
        limit: 1 
      }).then(hs => {

        if (hs.length == 0) {
          return null;
        }

        return hs[0];

      });

    });

}

function getScripts(folder) {

  return Promise.all([
    readdirAsync(`${folder}/up`),
    readdirAsync(`${folder}/down`)
  ]).then(scripts => {

    let [ups, downs] = scripts;

    ups = _.map(ups, u => path.basename(u, '.sql'));
    downs = _.map(downs, d => path.basename(d, '.sql'));
    
    _.sortBy(ups, u => { return parseInt(u.split('-')[0]); });
    _.sortBy(downs, d => { return parseInt(d.split('-')[0]); });

    return [ups, _.reverse(downs)];

  });

}

function getVersions(folder, from, to) {

  return getScripts(folder)
    .then(scripts => {

      let [ups, downs] = scripts;

      if (ups.length == 0 || downs.length == 0) {
        
        return {
          dir: null,
          versions: []
        };

      }

      if (to == '*') {
        to = ups[ups.length - 1];
      }

      if (from == null) {
        from = ups[0];
      }
        
      let fromInt = parseInt(from.split('-')[0]);
      let toInt = parseInt(to.split('-')[0]);

      if (fromInt < toInt) { /* migrating */

        return {
          dir: 1,
          versions: ups.splice(
                      ups.indexOf(from),
                      ups.indexOf(to) - ups.indexOf(from)
                    )
        };

      } else if (fromInt > toInt) { /* rollingback */

        return {
          dir: -1,
          versions: downs.splice(
                      downs.indexOf(to),
                      downs.indexOf(from) - downs.indexOf(to)
                    )
        };

      } else { /* re-apply? */
        return {
          dir: 0,
          versions: [ from ]
        };
      }

    });

}

async function runScripts(db, folder, mode, scripts) {

  const {MigrationHistory} = require('./models')(db);

  let action = mode == 'migrate' ? 'Migrating' : 'Rolling back';
  let subFolder = mode == 'migrate' ? 'up' : 'down';

  return await db.transaction(async t => {

    _.forEach(scripts, async script => {

      log.info(`${action} ${script}`);

      let scriptText = await readFileAsync(`${folder}/${subFolder}/${script}.sql`);

      try {
        scriptText = scriptText.toString();
        await db.query(scriptText, { raw: true, type: 'SELECT' });
      } catch (e) {
        log.error(`${action} ${script} failed: ${e.message}`);
        throw e;
      }

      let history = MigrationHistory.build({
        name: script,
        direction: mode,
        executed: new Date()
      });

      await history.save();

      log.success(`${action} of ${script} successful`);
    });

  });

}

module.exports = {
  dbForEnvironment,
  getCurrentVersion,
  getScripts,
  getVersions,
  runScripts
};
