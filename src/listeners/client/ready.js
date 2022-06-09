const logger = require('@mirasaki/logger');
const chalk = require('chalk');
const { ActivityType } = require('discord.js');

module.exports = (client) => {
  // Logging our process uptime to the developer
  const upTimeStr = chalk.yellow(`${Math.floor(process.uptime()) || 1} second(s)`);
  logger.success(`Client logged in as ${
    chalk.cyanBright(client.user.username)
  }${
    chalk.grey(`#${client.user.discriminator}`)
  } after ${upTimeStr}`);

  // Calculating the membercount
  const memberCount = client.guilds.cache.reduce(
    (previousValue, currentValue) =>
      previousValue += currentValue.memberCount, 0
  ).toLocaleString('en-US');

  // Getting the server count
  const serverCount = (client.guilds.cache.size).toLocaleString('en-US');

  // Logging counts to developers
  logger.info(`Ready to serve ${memberCount} members across ${serverCount} servers!`);

  // Setting the client status
  const { presence } = client.container.config;
  const activity = presence.activities[0];
  // Replacing available template tags
  activity.name = activity.name
    .replace(/{{memberCount}}/g, memberCount)
    .replace(/{{serverCount}}/g, serverCount);
  // https://discord-api-types.dev/api/discord-api-types-v10/enum/ActivityType
  client.user.setActivity(activity.name, { type: ActivityType[activity.type] });
  client.user.setStatus(presence.status);
};
