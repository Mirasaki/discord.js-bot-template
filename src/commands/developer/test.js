const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
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

    // Unavailable to non-admins in guilds
    default_member_permissions: 0
  },

  config: {
    permLevel: 'Developer',
    clientPerms: ['Administrator'],
    userPerms: ['ManageChannels', 'ManageGuild']
  },

  run: () => {
    // ...
  }
};
