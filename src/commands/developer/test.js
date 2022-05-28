module.exports = {
  data: {
    description: 'Test command for the developers',
    options: [
      {
        name: 'value',
        description: 'input',
        type: 3, // STRING
        required: true
      }
    ],

    // Unavailable in DMs and to non-admins in guilds
    dm_permission: false,
    default_member_permissions: 0
  },

  config: {
    permLevel: 'Developer',
    clientPerms: ['Administrator'],
    userPerms: ['ManageChannels', 'ManageGuild']
  },

  run: () => {
    // ...
  }
};
