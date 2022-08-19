const { permConfig } = require('../../handlers/permissions');

/**
 * @type {import('../../../typings').ChatInputCommand}
 */

module.exports = {
  data: {
    description: 'Display your bot permission level'
  },

  config: {
    globalCmd: true,
    cooldown: { // Default member type cooldown
      usages: 1,
      duration: 10
    }
  },

  run: async ({ client, interaction }) => {
    // Destructure
    const { member } = interaction;
    const { emojis } = client.container;

    // Definition/Variables
    const memberPermLevelName = permConfig.find(({ level }) => level === member.permLevel).name;

    // User feedback
    interaction.reply({
      content: `${member} ${emojis.success}, your permission level is **${member.permLevel} | ${memberPermLevelName}**`
    });
  }
};
