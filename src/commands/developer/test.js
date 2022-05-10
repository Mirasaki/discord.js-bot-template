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
    default_permission: false
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
