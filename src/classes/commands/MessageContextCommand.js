const APICommand = require('./APICommand');

/**
 * @augments APICommand
 */
class MessageContextCommand extends APICommand {
  constructor (cmd) {
    super(cmd);
    /**
     * @member {3} data.type The type of APICommand
     */
    this.data.type = 3; // MESSAGE Context Menu
  }
}

module.exports = MessageContextCommand;
