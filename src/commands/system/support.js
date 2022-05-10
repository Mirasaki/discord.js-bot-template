const { stripIndents } = require('common-tags');
const { colorResolver } = require('../../util');

module.exports = {
  data: {
    name: 'support',
    description: 'Get a link to this bot\'t support server'
  },

  config: {
    globalCmd: true
  },

  run: ({ client, interaction }) => {
    interaction.reply({
      embeds: [{
        // Not passing an parameter to colorResolver
        // fallsback to client.container.colors.main
        color: colorResolver(),
        author: {
          name: client.user.username,
          iconURL: client.user.avatarURL({ dynamic: true })
        },
        // Strip our indentation using common-tags
        description: stripIndents`
          [${client.user.username} Support Server](${client.container.config.supportServerInviteLink} "${client.user.username} Support Server")

          **__Use this server for:__**
          \`\`\`diff
            + Any issues you need support with
            + Bug reports
            + Giving feedback
            + Feature requests & suggestions
            + Testing beta features & commands
            + Keeping up-to-date with updates
          \`\`\`
        `
      }]
    });
  }
};
