const logger = require('@mirasaki/logger');
const chalk = require('chalk');

module.exports = (client, guild) => {
  if (!guild?.available) return;
  logger.success(`${chalk.redBright('[GUILD REMOVE]')} ${guild.name} has removed the bot!`);
};
