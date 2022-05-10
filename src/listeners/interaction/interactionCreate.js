const logger = require('@mirasaki/logger');
const { InteractionType } = require('discord.js');
const { getPermissionLevel } = require('../../handlers/permissions');

module.exports = (client, interaction) => {
  // Definitions
  const { emojis } = client.container;
  const { member, channel, user } = interaction;

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
  if (interaction.guild?.available !== true) {
    const { guild } = interaction;
    logger.debug(`Interaction returned, server unavailable.\nServer: ${guild.name} (${guild.id})`);
    return;
  }

  // Check for missing 'bot' scope
  if (!interaction.guild) {
    logger.debug('Interaction returned, missing \'bot\' scope / missing guild object in interaction.');
    return;
  }

  // Setting the permLevel on the member object
  const permLevel = getPermissionLevel(member, channel);
  interaction.member.permLevel = permLevel;

  // Switch case for our interaction.type
  switch (interaction.type) {
    // Ping Interaction
    case InteractionType.Ping: {
      client.emit('pingInteraction', (interaction));
      break;
    }
    // ApplicationCommand Interaction
    case InteractionType.ApplicationCommand: {
      client.emit('applicationCommandInteraction', (interaction));
      break;
    }
    // MessageComponent Interaction
    case InteractionType.MessageComponent: {
      client.emit('messageComponentInteraction', (interaction));
      break;
    }
    // ApplicationCommandAutocomplete Interaction
    case InteractionType.ApplicationCommandAutocomplete: {
      client.emit('autoCompleteInteraction', (interaction));
      break;
    }
    // ModalSubmit Interaction
    case InteractionType.ModalSubmit: {
      client.emit('modalSubmitInteraction', (interaction));
      break;
    }
    // Unknown interaction type - log to the console
    default: {
      logger.syserr(`Unknown interaction received: Type ${interaction.type}`);
      break;
    }
  }
};
