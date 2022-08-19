const logger = require('@mirasaki/logger');
const chalk = require('chalk');
const { commands } = require('../../client');
const APICommand = require('./APICommand');

const {
  DEBUG_ENABLED
} = process.env;

/**
 * @type {import('../../../typings').ChatInputCommand}
 */

class ChatInputCommand extends APICommand {
  constructor (cmd) {
    super(cmd);
    // Set API data defaults
    this.data.type = 1; // CHAT_INPUT
    if (!this.data.description) {
      throw new Error(`An InteractionCommand description is required by Discord's API\nCommand: ${this.data.name}`);
    }
  }

  // Reload function
  reload = () => {
    // Getting and deleting our current cmd module cache
    commands.delete(this.data.name);
    const filePath = this.config.filePath;
    const module = require.cache[require.resolve(filePath)];
    delete require.cache[require.resolve(filePath)];
    for (let i = 0; i < module.children.length; i++) {
      if (module.children[i] === module) {
        module.children.splice(i, 1);
        break;
      }
    }

    // Require as module
    const newModule = require(filePath);
    // Calling the class constructor
    const command = new this.constructor({ ...newModule, filePath });

    // Debug Logging
    if (DEBUG_ENABLED === 'true') {
      logger.debug(`Loading the <${chalk.cyanBright(command.data.name)}> command`);
    }

    // Set the command in our command collection
    commands.set(command.data.name, command);
  };
}

module.exports = ChatInputCommand;
