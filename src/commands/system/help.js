const path = require('path');
const { sortCommandsByCategory } = require('../../handlers/commands');
const { colorResolver, getFiles } = require('../../util');

const topLevelCommandFolder = path.join('src', 'commands');
for (const file of getFiles(topLevelCommandFolder, '.js', '.mjs', '.cjs')) {
  console.log(file);
}

module.exports = {
  data: {
    name: 'help',
    description: 'Receive detailed command information'
  },

  config: {
    globalCmd: true
  },

  run: ({ client, interaction }) => {
    // Destructure from interaction
    const { guild, member } = interaction;
    const { commands, colors } = client.container;

    // Generate our embed field data
    const fields = [
      ...sortCommandsByCategory(
        // Filtering out command the user doesn't have access to
        commands.filter((cmd) => cmd.config.permLevel <= member.permLevel)
      )
        .map((entry) => {
          return {
            name: `${entry.category}`,
            value: `**\`${
              entry.commands
                .map((cmd) => cmd.data.name)
                .join('`** - **`')
            }\`**`,
            inline: false
          };
        })
    ];

    // Reply to the interaction with our embed
    interaction.reply({
      embeds: [{
        title: `Command help for ${guild.name}`,
        color: colorResolver(colors.main),
        fields,
        footer: {
          text: `Requested by ${member.user.tag}`
        }
      }]
    });
  }
};
