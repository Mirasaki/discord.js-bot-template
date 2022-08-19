const CommandBase = require('./CommandBase');

class APICommand extends CommandBase {
  constructor (cmd) {
    super(cmd);

    // Command availability
    this.config.globalCmd = this.config.globalCmd || false;
  }
}

module.exports = APICommand;
