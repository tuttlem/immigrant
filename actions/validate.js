
const fs = require('fs');
const {promisify} = require('util');
const _ = require('lodash');

const readdirAsync = promisify(fs.readdir);

/**
 * Validate that the requested folder is empty
 * @function checkDirectoryEmpty
 * @param {string} folder The directory to check
 * @returns {Promise[boolean]} true if the folder is empty, otherwise false
 */
function checkDirectoryEmpty(folder) {

  return readdirAsync(folder)
    .then(fs => {

      if  (fs.length > 0) {
        return false;
      }

      return true;

    });

}

/**
 * Validate that the requested folder has the structure of an immigrant project
 * @function checkIsProjectDirectory
 * @param {string} folder The directory to check
 * @returns {Promise[boolean]} true if the folder is in the correct shape, otherwise false
 */
function checkIsProjectDirectory(folder) {

  return readdirAsync(folder)
    .then(fs => {

      const required = [
        'up', 'down', 'config.json'
      ];

      // all of the required files/directories must be present
      return _.intersection(required, fs).length == 3;

    });

}

module.exports = {
  checkDirectoryEmpty,
  checkIsProjectDirectory
};

