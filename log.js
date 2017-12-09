
class Logger {

  success(msg) {
    console.log(`✓ ${msg}`.green);
  }

  error(msg) {
    console.log(`✖ ${msg}`.red);
  }

  warn(msg) {
    console.log(`! ${msg}`.yellow);
  }

  mute(msg) {
    console.log(`• ${msg}`.grey);
  }

  info(msg) {
    console.log(`☆ ${msg}`.cyan);
  }

}

module.exports = new Logger();
