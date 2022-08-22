const { ApplicationCommandOptionType } = require('discord.js');
const { CommandBase, ChatInputCommand } = require('../../classes/Commands');

module.exports = new ChatInputCommand({
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
});

