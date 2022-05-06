const { stripIndents } = require('common-tags');

module.exports = {
  data: {
    name: 'support',
    description: 'Get a link to this bot\'t support server'
  },

  run: ({ client, interaction }) => {
    interaction.reply({
      embeds: [{
        color: 6618980,
        author: {
          name: client.user.username,
          iconURL: client.user.avatarURL({ dynamic: true })
        },
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
