const logger = require('@mirasaki/logger');
const chalk = require('chalk');
const { stripIndents } = require('common-tags');
const { throttleCommand } = require('../../handlers/commands');
const { hasChannelPerms } = require('../../handlers/permissions');
const { titleCase } = require('../../util');

// Destructuring from env
const {
  DEBUG_ENABLED,
  DEBUG_INTERACTIONS
} = process.env;

module.exports = (client, interaction) => {
  // Destructure from interaction
  const {
    member,
    channel,
    guild,
    commandName
  } = interaction;

  // Initial performace measuring timer
  const cmdRunTimeStart = process.hrtime();

  // Logging the Command to our console
  console.log([
    `${logger.timestamp()} ${chalk.white('[CMD]')}    : ${chalk.bold(titleCase(commandName))}`,
    guild.name,
    `#${channel.name}`,
    member.user.username
  ].join(chalk.magentaBright(' • ')));

  // Conditional Debug logging
  if (DEBUG_INTERACTIONS === 'true') {
    logger.startLog('Application Command Interaction');
    console.dir(interaction, { showHidden: false, depth: 0, colors: true });
    logger.endLog('Application Command Interaction');
  }

  // Get the client.container.commands command
  const { commands, emojis } = client.container;
  const clientCmd = commands.get(commandName);
  const { data, config } = clientCmd;
  const clientCanReply = interaction.isRepliable();

  // Return if we can't reply to the interacion
  if (!clientCanReply) {
    logger.debug(`Interaction returned - Interaction not repliable\nCommand: ${data.name}\nServer: ${guild.name}\nChannel: #${channel.name}\nMember: ${member}`);
    return;
  }

  // Check if the command exists
  if (!clientCmd) {
    interaction.reply({
      content: stripIndents`
        ${emojis} ${member}, this command doesn't exist anymore.
        If you're seeing this message, please wait a moment for Slash Commands to sync in this server.
      `
    });
    return;
  }

  // Check if the command is currently disabled
  // Needed 'cuz it takes a while for CommandInteractions to sync across server
  if (config.enabled === false) {
    interaction.reply({
      content: `${emojis} ${member}, this command is currently disabled. Please try again later.`
    });
    return;
  }

  // Get permission levels
  const commandPermLvl = config.permLevel;

  // Fallback for unexpected results
  if (isNaN(commandPermLvl)) {
    interaction.reply({
      content: `${emojis.error} ${member}, something went wrong while using this command.\n${emojis.info} This issue has been logged to the developer.\n${emojis.wait} Please try again later`,
      ephemeral: true
    });
    logger.syserr(`Interaction returned: Calculated permission level for command ${data.name} is NaN.`);
    return;
  }

  // Check if they have the required permission level
  if (commandPermLvl > member.permLevel) {
    interaction.reply({
      content: `${emojis.error} ${member}, you do not have the required permission level to use this command.`
    });
    return;
  }

  // Check for missing client Discord App permissions
  if (config.clientPerms.length !== 0) {
    const missingPerms = hasChannelPerms(client.user.id, channel, config.clientPerms);
    if (missingPerms !== true) {
      interaction.reply({
        content: `${emojis.error} ${member}, this command can't be executed because I lack the following permissions in ${channel}\n${emojis.bulletPoint} ${missingPerms.join(', ')}`
      });
      return;
    }
  }

  // Check for missing user Discord App permissions
  if (config.userPerms.length !== 0) {
    const missingPerms = hasChannelPerms(member.user.id, channel, config.userPerms);
    if (missingPerms !== true) {
      interaction.reply({
        content: `${emojis.error} ${member}, this command can't be executed because you lack the following permissions in ${channel}:\n${emojis.bulletPoint} ${missingPerms.join(', ')}`
      });
      return;
    }
  }

  // Check for NSFW commands and channels
  if (config.nsfw === true && channel.nsfw !== true) {
    interaction.reply({
      content: `${emojis.error} ${member}, that command is marked as **NSFW**, you can't use it in a **SFW** channel!`,
      ephemeral: true
    });
    return;
  }

  // Throttle the command
  // permLevel 4 = Developer
  if (member.permLevel < 4) {
    const onCooldown = throttleCommand(clientCmd, `${guild.id}${member.id}`);
    if (onCooldown !== false) {
      interaction.reply({
        content: onCooldown.replace('{{user}}', `${member}`)
      });
      return;
    }
  }

  /*
    All checks have passed
    Run the command
    While catching possible errors
   */
  (async () => {
    try {
      await clientCmd.run({ client, interaction });
    } catch (err) {
      logger.syserr(`An error has occurred while executing the /${chalk.whiteBright(commandName)} command`);
      logger.printErr(err);
    }
  })();

  // Log command execution time
  if (DEBUG_ENABLED === 'true') {
    logger.debug(`${chalk.white(commandName)} executed in ${logger.getExecutionTime(cmdRunTimeStart)}`);
  }
};
