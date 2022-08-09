// discordjs type definitions
const { ActivityType, PresenceUpdateStatus } = require('discord.js');

const config = {
  // Array of Intents your bot needs
  // https://discord.com/developers/docs/topics/gateway#gateway-intents
  intents: [ 'GUILDS' ],

  // Bot activity
  presence: {
    // One of online, idle, invisible, dnd
    status: PresenceUpdateStatus['online'],
    activities: [
      {
        name: '/help',
        // Activity type ENUM
        // Playing = 0, Streaming = 1, Listening = 2, Watching = 3
        type: ActivityType[0]
      }
    ]
  },

  // Permission config
  permissions: {
    // Bot Owner, highest permission level (5)
    ownerId: '290182686365188096',

    // Bot developers, second to highest permission level (4)
    developers: [ '290182686365188096' ]
  },

  // The Discord server invite to your Support server
  supportServerInviteLink: 'https://discord.gg/KaxTGGg4jK'
};

module.exports = config;
