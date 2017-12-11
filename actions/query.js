
const os = require('os');
const fs = require('fs');
const {promisify} = require('util');
const log = require('../log');
const {checkIsProjectDirectory} = require('./validate');

const {
  dbForEnvironment,
  getCurrentVersion
} = require('../common');

module.exports = async (env) => {

  let folder = process.cwd();

  try {

    let ok = await checkIsProjectDirectory(folder);

    if (!ok) {
      throw new Error('Current folder doesn\'t look like an immigrant project folder');
    }

    let db = await dbForEnvironment(env);
    let ver = await getCurrentVersion(db);

    if (!ver) {
      log.warn('No versions have been migrated yet');
    } else {
      log.info(ver.name);
    }

  } catch (err) {
    log.error(err.message);
  }

};
