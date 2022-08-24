const logger = require('@mirasaki/logger');
const chalk = require('chalk');
const { InteractionType } = require('discord.js');
const {
  checkCommandCanExecute,
  throttleCommand,
  hasAccessToComponentCommand
} = require('../../handlers/commands');
const { getPermissionLevel } = require('../../handlers/permissions');
const { titleCase, getRuntime } = require('../../util');

const {
  DEBUG_ENABLED,
  DEBUG_INTERACTIONS
} = process.env;

/**
 * @type {import('../../../typings').InteractionEventCallback}
 */

// eslint-disable-next-line sonarjs/cognitive-complexity
module.exports = (client, interaction) => {
  // Definitions
  const { emojis, commands, contextMenus, buttons, modals, selectMenus } = client.container;
  const { member, channel, user, commandName, customId, guild } = interaction;

  // Initial performance measuring timer
  const cmdRunTimeStart = process.hrtime.bigint();

  // Check for DM interactions
  // Planning on adding support later down the road
  if (!interaction.inGuild()) {
    if (interaction.isRepliable()) {
      interaction.reply({
        content: `${emojis.error} ${member || user}, I don't currently support DM interactions. Please try again in a server.`
      });
    }
    return;
  }

  // Check for outages
  if (guild?.available !== true) {
    const { guild } = interaction;
    logger.debug(`Interaction returned, server unavailable.\nServer: ${guild.name} (${guild.id})`);
    return;
  }

  // Check for missing 'bot' scope
  if (!interaction.guild) {
    logger.debug('Interaction returned, missing \'bot\' scope / missing guild object in interaction.');
    return;
  }

  // Conditional Debug logging
  if (DEBUG_INTERACTIONS === 'true') {
    logger.startLog('New Interaction');
    console.dir(interaction, { showHidden: false, depth: 0, colors: true });
    logger.endLog('New Interaction');
  }

  // Setting the permLevel on the member object before we do anything else
  const permLevel = getPermissionLevel(member, channel);
  interaction.member.permLevel = permLevel;

  // Handle ping interactions in separate file
  if (interaction.type === InteractionType.Ping) {
    client.emit('pingInteraction', (interaction));
    return;
  }

  // Search the client.container.collections for the command
  const activeId = commandName || customId;
  const isAutoComplete = interaction.type === InteractionType.ApplicationCommandAutocomplete;

  // Execute early if autocomplete,
  // avoiding the permission checks
  // (as this is managed through default_member_permissions)
  if (isAutoComplete) {
    client.emit('autoCompleteInteraction', (interaction));
    return;
  }

  // Grab the command
  const clientCmd = commands.get(activeId)
    || contextMenus.get(activeId)
    || buttons.get(activeId)
    || modals.get(activeId)
    || selectMenus.get(activeId);

  // Check for late API changes
  if (!clientCmd) {
    interaction.reply({
      content: `${emojis.error} ${member}, this command currently isn't available.`,
      ephemeral: true
    });
    logger.syserr(`Missing interaction listener for "${activeId}" (name for commands, customId for components)`);
    return;
  }

  // Grab our data object from the client command
  const { data } = clientCmd;

  // Return if we can't reply to the interaction
  const clientCanReply = interaction.isRepliable();
  if (!clientCanReply) {
    logger.debug(`Interaction returned - Can't reply to interaction\nCommand: ${data.name}\nServer: ${guild.name}\nChannel: #${channel.name}\nMember: ${member}`);
    return;
  }

  // Check if the Component Command is meant for the member initiating it
  if (
    interaction.isButton()
    || interaction.isSelectMenu()
    || interaction.isMessageComponent()
  ) {
    const componentIsForMember = hasAccessToComponentCommand(interaction);
    if (!componentIsForMember) {
      interaction.reply({
        content: `${emojis.error} ${member}, this message component isn't meant for you.`,
        ephemeral: true
      });
      return;
    }
  }

  // Perform our additional checks
  // Like permissions, NSFW, status, availability
  if (checkCommandCanExecute(client, interaction, clientCmd) === false) {
    // If individual checks fail
    // the function returns false and provides user feedback
    return;
  }

  // Throttle the command
  // permLevel 4 = Developer
  if (member.permLevel < 4) {
    const onCooldown = throttleCommand(clientCmd, interaction);
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
      await clientCmd.run(client, interaction);
    } catch (err) {
      logger.syserr(`An error has occurred while executing the /${chalk.whiteBright(activeId)} command`);
      console.error(err);
    }

    // Log command execution time
    if (DEBUG_ENABLED === 'true') {
      logger.debug(`${chalk.white(activeId)} executed in ${getRuntime(cmdRunTimeStart).ms} ms`);
    }
  })();

  // Logging the Command to our console
  console.log([
    `${logger.timestamp()} ${chalk.white('[CMD]')}    : ${chalk.bold(titleCase(activeId))} (${InteractionType[interaction.type]})`,
    guild.name,
    `#${channel.name}`,
    member.user.username
  ].join(chalk.magentaBright(` ${emojis.separator} `)));
};
