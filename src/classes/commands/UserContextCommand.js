const APICommand = require('./APICommand');

/**
 * @augments APICommand
 */
class UserContextCommand extends APICommand {
  constructor (cmd) {
    super(cmd);
    this.data.type = 2; // USER Context Menu
  }
}

module.exports = UserContextCommand;
