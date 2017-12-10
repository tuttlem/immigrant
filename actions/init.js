
const fs = require('fs');
const {promisify} = require('util');
const log = require('../log');
const {checkDirectoryEmpty} = require('./validate');

const readdirAsync = promisify(fs.readdir),
  mkdirAsync = promisify(fs.mkdir),
  writeFileAsync = promisify(fs.writeFile),
  existsAsync = promisify(fs.exists);

module.exports = (name) => {

  let sampleConfig = {
    "dev": null,
    "test": null,
    "production": null
  };

  existsAsync(`./${name}`)
    .then(ok => {

      if (ok) {
        throw new Error('Directory already exists');
      }

      return mkdirAsync(`./${name}`)
        .then(() => {

          let jobs = [
            mkdirAsync(`./${name}/up`),
            mkdirAsync(`./${name}/down`),
            writeFileAsync(`./${name}/config.json`, JSON.stringify(sampleConfig))
          ];

          Promise.all(jobs)
            .then(() => {

              log.info('Successfully initialized project');

            });
        });

    })
    .catch(err => {
      log.error(err.message);
    });

};

