
const os = require('os');
const fs = require('fs');
const {promisify} = require('util');
const log = require('../log');
const {checkIsProjectDirectory} = require('./validate');

const {
  dbForEnvironment,
  getCurrentVersion,
  getDirection,
  getLocalVersions,
  getVersionRange,
  executeScripts
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
    let dbVer       = await getCurrentVersion(db, folder);
  
    let from        = dbVer == null ? null : dbVer;
    let to          = ver;

    if (getDirection(folder, from, to) < 0) {
      throw new Error('The database is passed the requested version');
    }
    
    let vs          = await getVersionRange(folder, from, to);

    if (vs.length == 0) {
      log.warn('No work required');
      return ;
    }

    await executeScripts(db, folder, vs, 'migrate');
    
  } catch (e) {
    log.error(e.message);
  }

};
