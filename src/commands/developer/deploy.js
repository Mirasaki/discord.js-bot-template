const { stripIndents } = require('common-tags');
const { refreshSlashCommandData } = require('../../handlers/commands');

module.exports = {
  data: {
    name: 'deploy',
    description: 'Re-deploy ApplicationCommand API data',

    // Unavailable to non-admins in guilds
    default_member_permissions: 0
  },

  config: {
    permLevel: 'Developer'
  },

  run: async ({ client, interaction }) => {
    const { member } = interaction;
    const { emojis } = client.container;

    // Calling our command handler function
    refreshSlashCommandData(client);

    // Sending user feedback
    interaction.reply({
      content: stripIndents`
        ${emojis.success} ${member}, [ApplicationCommandData](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure "ApplicationCommandData on discord.com/developers") has been refreshed.
        ${emojis.wait} - changes to global commands can take up to an hour to take effect...
      `
    });
  }
};
