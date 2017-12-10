
const os = require('os');
const fs = require('fs');
const {promisify} = require('util');
const log = require('../log');
const {checkIsProjectDirectory} = require('./validate');

const {
  dbForEnvironment,
  getCurrentVersion
} = require('../common');

module.exports = (env) => {

  let folder = process.cwd();

  return checkIsProjectDirectory(folder)
    .then(ok => {

      if (!ok) {
        throw new Error('Current folder doesn\'t look like an immigrant project folder');
      }

      return dbForEnvironment(env)
        .then(db => {

          return getCurrentVersion(db)
            .then(ver => {

              if (!ver) {
                log.warn('No versions have been migrated yet');
              } else {
                log.info(ver.name);
              }

            });

        });
      
    })
    .catch(err => {
      log.error(err.message);
    });
};
