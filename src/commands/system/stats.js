const { stripIndents } = require('common-tags');
const { version } = require('discord.js');
const { colorResolver } = require('../../util');

const discordVersion =	version.indexOf('dev') < 0 ? version : version.slice(0, version.indexOf('dev') + 3);
const discordVersionDocLink = `https://discord.js.org/#/docs/discord.js/v${discordVersion.split('.')[0]}/general/welcome`;
const nodeVersionDocLink = `https://nodejs.org/docs/latest-${process.version.split('.')[0]}.x/api/#`;

module.exports = {
  data: {
    name: 'stats',
    description: 'Displays bot stats'
  },

  config: {
    globalCmd: true
  },

  run: async ({ client, interaction }) => {
    // Calculating our API latency
    const latency = Math.round(client.ws.ping);
    const sent = await interaction.reply({
      content: 'Pinging...',
      fetchReply: true
    });
    const fcLatency = sent.createdTimestamp - interaction.createdTimestamp;

    // Utility function for getting appropriate status emojis
    const getMsEmoji = (ms) => {
      let emoji = undefined;
      for (const [key, value] of Object.entries({
        250: '🟢',
        500: '🟡',
        1000: '🟠'
      })) if (ms <= key) {
        emoji = value;
        break;
      }
      return (emoji ??= '🔴');
    };

    // Replying to the interaction with our embed data
    interaction.editReply({
      content: '\u200b',
      embeds: [
        {
          color: colorResolver(),
          author: {
            name: `${client.user.tag}`,
            iconURL: client.user.displayAvatarURL()
          },
          fields: [
            {
              name: 'Latency',
              value: stripIndents`
                ${getMsEmoji(latency)} **API Latency:** ${latency} ms
                ${getMsEmoji(fcLatency)} **Full Circle Latency:** ${fcLatency} ms
              `,
              inline: true
            },
            {
              name: 'Memory',
              value: stripIndents`
                💾 **Memory Usage:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
                ♻️ **Cache Size:** ${(process.memoryUsage().external / 1024 / 1024).toFixed(2)} MB
              `,
              inline: true
            },
            {
              name: 'Uptime',
              value: stripIndents`**📊 I've been online for ${parseInt((client.uptime / (1000 * 60 * 60 * 24)) % 60, 10)} days, ${parseInt((client.uptime / (1000 * 60 * 60)) % 24, 10)} hours, ${parseInt((client.uptime / (1000 * 60)) % 60, 10)} minutes and ${parseInt((client.uptime / 1000) % 60, 10)}.${parseInt((client.uptime % 1000) / 100, 10)} seconds!**`,
              inline: false
            },
            {
              name: 'System',
              value: stripIndents`
                ⚙️ **Discord.js Version:** [v${discordVersion}](${discordVersionDocLink})
                ⚙️ **Node Version:** [${process.version}](${nodeVersionDocLink})
              `,
              inline: true
            },
            {
              name: 'Stats',
              value: stripIndents`
                👪 **Servers:** ${client.guilds.cache.size.toLocaleString('en-US')}
                🙋 **Users:** ${client.guilds.cache.reduce((previousValue, currentValue) => previousValue += currentValue.memberCount, 0).toLocaleString('en-US')}
              `,
              inline: true
            }
          ],
          footer: {
            text: 'Made with ❤️ by Mirasaki#0001 • Open to collaborate • me@mirasaki.dev'
          }
        }
      ]
    });
  }
};
