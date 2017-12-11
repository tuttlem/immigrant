
const fs = require('fs');
const {promisify} = require('util');
const log = require('../log');
const {checkDirectoryEmpty} = require('./validate');

const readdirAsync = promisify(fs.readdir),
  mkdirAsync = promisify(fs.mkdir),
  writeFileAsync = promisify(fs.writeFile),
  existsAsync = promisify(fs.exists);

module.exports = async (name) => {

  let sampleConfig = {
    "dev": null,
    "test": null,
    "production": null
  };

  try {

    let hasFolder = await existsAsync(`./${name}`);

    if (hasFolder) {
      throw new Error('Directory already exists');
    }

    await mkdirAsync(`./${name}`);

    await Promise.all([
      mkdirAsync(`./${name}/up`),
      mkdirAsync(`./${name}/down`),
      writeFileAsync(`./${name}/config.json`, JSON.stringify(sampleConfig))
    ]);

    log.info('Successfully initialized project');

  } catch (err) {
    log.error(err.message);
  }

};

