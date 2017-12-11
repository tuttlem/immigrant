
const os = require('os');
const fs = require('fs');
const {promisify} = require('util');
const log = require('../log');
const {checkIsProjectDirectory} = require('./validate');

const {
  dbForEnvironment,
  getCurrentVersion,
  getVersions,
  runScripts
} = require('../common');

const readdirAsync = promisify(fs.readdir),
  mkdirAsync = promisify(fs.mkdir),
  writeFileAsync = promisify(fs.writeFile);

module.exports = async (env, ver) => {

  let folder = process.cwd();

  try {

    let directoryOk = await checkIsProjectDirectory(folder);

    if (!directoryOk) {
      throw new Error('Current folder doesn\'t look like an immigrant project folder');
    }

    let db          = await dbForEnvironment(env);
    let dbVer       = await getCurrentVersion(db);
    let vs          = await getVersions(folder, dbVer, ver);

    // check that we're going in the right direction
    if (vs.direction < 0) {
      throw new Error('The migration specified for "to" occurs before the migration specified for "for"');
    }

    if (vs.versions.length == 0) {
      log.warn('No work required');
      return ;
    }

    await runScripts(db, folder, 'migrate', vs.versions);
    
  } catch (e) {
    log.error(e.message);
  }

};
