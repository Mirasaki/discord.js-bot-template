const { ApplicationCommandOptionType } = require('discord.js');

/**
 * @type {import('../../../typings').ChatInputCommand}
 */

module.exports = {
  permLevel: 'Developer',
  data: {
    description: 'Test command for the developers',
    options: [
      {
        name: 'value',
        description: 'input',
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ],
    default_member_permissions: 0 // Unavailable to non-admins in guilds
  },

  run: (client, interaction) => {
    // ...
  }
};
