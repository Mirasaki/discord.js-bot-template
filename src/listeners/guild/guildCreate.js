const logger = require('@mirasaki/logger');
const chalk = require('chalk');

module.exports = (client, guild) => {
  if (!guild?.available) return;
  logger.success(`${chalk.greenBright('[GUILD JOIN]')} ${guild.name} has added the bot! Members: ${guild.memberCount}`);
};
