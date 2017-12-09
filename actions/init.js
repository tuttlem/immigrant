
const fs = require('fs');
const {promisify} = require('util');
const log = require('../log');
const {checkDirectoryEmpty} = require('./validate');

const readdirAsync = promisify(fs.readdir),
  mkdirAsync = promisify(fs.mkdir),
  writeFileAsync = promisify(fs.writeFile);

module.exports = () => {

  let sampleConfig = {
    "dev": null,
    "test": null,
    "production": null
  };

  let folder = process.cwd();

  checkDirectoryEmpty(folder)
    .then(ok => {

      if (!ok) {
        throw new Error('Can\'t initialize a project in an unempty folder');
      }

      let jobs = [
        mkdirAsync('./up'),
        mkdirAsync('./down'),
        writeFileAsync('./config.json', JSON.stringify(sampleConfig))
      ];

      Promise.all(jobs)
        .then(() => {

          log.info('Successfully initialized project');

        });
    })
    .catch(err => {
      log.error(err.message);
    });

};

