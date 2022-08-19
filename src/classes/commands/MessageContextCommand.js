const APICommand = require('./APICommand');

class MessageContextCommand extends APICommand {
  constructor (cmd) {
    super(cmd);
    this.data.type = 3; // MESSAGE Context Menu
  }
}

module.exports = MessageContextCommand;
