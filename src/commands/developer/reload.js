const { ApplicationCommandOptionType } = require('discord.js');
const { colorResolver } = require('../../util');

/*
  I don't really see the value in having a reload command
  when there's options like nodemon available
  for active development, but still, it's here
*/

/**
 * @type {import('../../../typings').ChatInputCommand}
 */

module.exports = {
  permLevel: 'Developer',
  data: {
    description: 'Reload an active, existing command',
    options: [{
      type: ApplicationCommandOptionType.String,
      name: 'command',
      description: 'Command name or category',
      autocomplete: true,
      required: true
    }]
  },

  run: async (client, interaction) => {
    // Destructure
    const { member, options } = interaction;
    const { emojis, colors, commands } = client.container;

    // Variables definitions
    const commandName = options.getString('command');
    const command = commands.get(commandName);

    // Check is valid command
    if (!command) {
      interaction.reply({
        content: `${emojis.error} ${member}, couldn't find any commands named \`${commandName}\`.`
      });
      return;
    }

    // Deferring our reply
    await interaction.deferReply();

    // Try to reload the command
    try {
      command.reload();
    } catch (err) {
      // Properly handling errors
      interaction.editReply({
        content: `${emojis.error} ${member}, error encountered while reloading the command \`${commandName}\`, click spoiler-block below to reveal.\n\n||${err.stack || err}||`
      });
      return;
    }

    // Command successfully reloaded
    interaction.editReply({
      content: `${emojis.success} ${member}, reloaded the \`/${commandName}\` command`,
      embeds: [
        {
          color: colorResolver(colors.invisible),
          footer: {
            text: 'Don\'t forget to use the /deploy command if you made any changes to the command data object'
          }
        }
      ]
    });
  }
};
