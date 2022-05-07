module.exports = {
  data: {
    description: 'Test command for the developers',
    options: [
      {
        name: 'value',
        description: 'First test, required',
        type: 3, // STRING
        required: true
      }
    ]
  },

  config: {
    permLevel: 'Developer',
    clientPerms: ['Administrator', 'ManageChannels'],
    userPerms: ['ManageChannels', 'ManageGuild']
  },

  run: () => {
    sahdghsad;
  }
};
