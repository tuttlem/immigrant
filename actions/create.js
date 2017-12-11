
const os = require('os');
const fs = require('fs');
const {promisify} = require('util');
const log = require('../log');
const {checkIsProjectDirectory} = require('./validate');

const readdirAsync = promisify(fs.readdir),
  mkdirAsync = promisify(fs.mkdir),
  writeFileAsync = promisify(fs.writeFile);

module.exports = async (name) => {

  const kebabCase = string => string.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase();
  let folder = process.cwd();

  try {

    let ok = await checkIsProjectDirectory(folder);

    if (!ok) {
      throw new Error('Current folder doesn\'t look like an immigrant project folder');
    }

    let user = os.userInfo().username;
    let date = new Date();
    let dateStamp = (date).getTime();
    migrationName = `${dateStamp}-${kebabCase(name)}`;

    const fileBannerUp = `
  /* Migration script
   * Created: ${date}
   * Author: ${user}
   * Migration: ${name}
   */`;

    const fileBannerDown = `
  /* Rollback script
   * Created: ${date}
   * Author: ${user}
   * Migration: ${name}
   */`;

        // create the up and down scripts
    await Promise.all([
      writeFileAsync(`./up/${migrationName}.sql`, fileBannerUp),
      writeFileAsync(`./down/${migrationName}.sql`, fileBannerDown)
    ]);
      
    log.info(`Created migration ${migrationName}`);

  } catch (err) {
    log.error(err.message);
  };

};
