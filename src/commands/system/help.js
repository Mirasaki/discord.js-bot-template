const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const { sortCommandsByCategory } = require('../../handlers/commands');
const { colorResolver, titleCase, splitCamelCaseStr } = require('../../util');

module.exports = {
  data: {
    name: 'help',
    description: 'Receive detailed command information',
    options: [{
      type: ApplicationCommandOptionType.String,
      name: 'command',
      description: 'Command name or category',
      autocomplete: true,
      required: false
    }]
  },

  config: {
    globalCmd: true,
    cooldown: {
      usages: 2,
      duration: 10
    }
  },

  run: ({ client, interaction }) => {
    // Destructuring
    const { guild, member, channel } = interaction;
    const { commands, colors, emojis } = client.container;

    // Check for optional autocomplete focus
    const commandName = interaction.options.getString('command');
    const hasCommandArg = commandName !== null && typeof commandName !== 'undefined';

    // Show command overview is no command parameter is supplied
    if (!hasCommandArg) {
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
      return;
    }

    // Request HAS optional command argument
    // Assigning our data
    const clientCmd = commands.get(commandName);

    // Checking if the commandName is a valid client command
    if (!clientCmd) {
      interaction.reply({
        content: `${emojis.error} ${member}, I couldn't find the command **\`/${commandName}\`**`,
        ephemeral: true
      });
      return;
    }

    // Destructure from our clientCmd object
    const { data, config } = clientCmd;

    // Utility function for displaying our permission requirements
    const getPermOutput = (permArr) => {
      return permArr.length >= 1
        ? permArr
          .map((perm) => `${
            channel.permissionsFor(member.user.id).has(PermissionsBitField.Flags[perm])
              ? emojis.success
              : emojis.error
          } ${splitCamelCaseStr(perm, ' ')}
          `)
          .join('\n')
        : `${emojis.success} None required`;
    };

    // Building our Embed object
    const embedFieldData = [{
      color: colorResolver(colors.main),
      title: titleCase(data.name),
      description: `${data.description}`,
      fields: [
        {
          name: 'Category',
          value: titleCase(data.category),
          inline:  true
        },
        {
          name: `${emojis.wait} Cooldown`,
          value: `You can use this command **${
            config.cooldown.usages === 1 ? 'once' :
              config.cooldown.usages === 2 ? 'twice' : `${config.cooldown.usages} times`
          }** every **${config.cooldown.duration}** second${config.cooldown.duration === 1 ? '' : 's'}`,
          inline: false
        },
        {
          name: 'Client Permissions',
          value: getPermOutput(config.clientPerms),
          inline: true
        },
        {
          name: 'User Permissions',
          value: getPermOutput(config.userPerms),
          inline: true
        },
        {
          name: 'SFW',
          value: data.NSFW === true ? `${emojis.error} This command is **not** SFW` : `${emojis.success} This command **is** SFW`,
          inline: false
        }
      ]
    }];

    // Replying with our command information embed
    interaction.reply({
      embeds: embedFieldData
    });
  }
};
