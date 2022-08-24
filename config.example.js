const config = {
  // Array of Intents your bot needs
  // https://discord.com/developers/docs/topics/gateway#gateway-intents
  intents: [ 'Guilds', 'GuildMessages' ],

  // Bot activity
  presence: {
    // One of online, idle, invisible, dnd
    status: 'online',
    activities: [
      {
        name: '/help',
        // One of Playing, Streaming, Listening, Watching
        type: 'Listening'
      }
    ]
  },

  // Permission config
  permissions: {
    // Bot Owner, highest permission level (5)
    ownerId: '290182686365188096',

    // Bot developers, second to highest permission level (4)
    developers: [ '625286565375246366' ]
  },

  // The Discord server invite to your Support server
  supportServerInviteLink: 'https://discord.gg/KaxTGGg4jK'
};

module.exports = config;
