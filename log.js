
class Logger {

  format(msg) {

    if (typeof msg == 'object') {
      return JSON.stringify(msg);
    }

    return msg;

  }

  success(msg) {
    console.log(`✓ ${this.format(msg)}`.green);
  }

  error(msg) {
    console.log(`✖ ${this.format(msg)}`.red);
  }

  warn(msg) {
    console.log(`! ${this.format(msg)}`.yellow);
  }

  mute(msg) {
    console.log(`• ${this.format(msg)}`.white);
  }

  info(msg) {
    console.log(`☆ ${this.format(msg)}`.cyan);
  }

}

module.exports = new Logger();
