const { isAppropriateCommandFilter, getCommandMap } = require('../../handlers/commands');

/**
 * @type {import('../../../typings').ComponentCommand}
 */

module.exports = {
  run: async ({ client, interaction, query }) => {
    const { member } = interaction;
    // Filtering out unusable commands
    const commandMap = getCommandMap();
    const workingCmdMap = commandMap.filter((cmd) => isAppropriateCommandFilter(member, cmd));

    // Getting our search query's results
    const queryResult = workingCmdMap.filter(
      (cmd) =>
        // Filtering matches by name
        cmd.name.toLowerCase().indexOf(query) >= 0
        // Filtering matches by category
        || cmd.category.toLowerCase().indexOf(query) >= 0
    );

    // Structuring our result for Discord's API
    return queryResult
      .map(cmd => ({ name: cmd.name, value: cmd.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
};
