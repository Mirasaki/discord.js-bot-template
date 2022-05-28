const { stripIndents } = require('common-tags');
const { refreshSlashCommandData } = require('../../handlers/commands');

module.exports = {
  data: {
    name: 'deploy',
    description: 'Re-deploy ApplicationCommand API data',

    // Unavailable in DMs and to non-admins in guilds
    dm_permission: false,
    default_member_permissions: 0
  },

  config: {
    permLevel: 'Developer'
  },

  run: async ({ client, interaction }) => {
    const { member } = interaction;
    const { emojis } = client.container;

    // Calling our command handler function and sending user feedback
    refreshSlashCommandData(client);
    interaction.reply({
      content: stripIndents`
        ${emojis.success} ${member}, ApplicationCommand data has been refreshed.
        ${emojis.wait} - changes to global command can take up to an hour to take effect...
      `
    });
  }
};
