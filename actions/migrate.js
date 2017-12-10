
const os = require('os');
const fs = require('fs');
const {promisify} = require('util');
const log = require('../log');
const {checkIsProjectDirectory} = require('./validate');

const {
  dbForEnvironment,
  getCurrentVersion,
  getVersions
} = require('../common');

const readdirAsync = promisify(fs.readdir),
  mkdirAsync = promisify(fs.mkdir),
  writeFileAsync = promisify(fs.writeFile);

module.exports = (env, ver) => {

  let folder = process.cwd();

  checkIsProjectDirectory(folder)
    .then(ok => {

      if (!ok) {
        throw new Error('Current folder doesn\'t look like an immigrant project folder');
      }
      
      return dbForEnvironment(env)
        .then(db => {

          return getCurrentVersion(db)
            .then(dbVer => {

              return getVersions(folder, dbVer, ver)
                .then(vs => {

                  // check that we're going in the right direction
                  if (vs.direction < 0) {
                    throw new Error('The migration specified for "to" occurs before the migration specified for "for"');
                  }

                  if (vs.versions.length == 0) {
                    log.warn('No work required');
                  }

                  // TODO: run migrations
                  
                });

            });

        });
      
    }).catch(err => log.error(err.message));

};
