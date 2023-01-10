const { ComponentCommand } = require('../../classes/Commands');
const { isAppropriateCommandFilter } = require('../../handlers/commands');

module.exports = new ComponentCommand({ run: async (client, interaction, query) => {
  const { member } = interaction;
  // Filtering out unusable commands
  const { commands, contextMenus } = client.container;
  const workingCmdMap = commands.concat(contextMenus)
    .filter((cmd) => isAppropriateCommandFilter(member, cmd));

  // Getting our search query's results
  const queryResult = workingCmdMap.filter(
    (cmd) => cmd.data.name.toLowerCase().indexOf(query) >= 0
      // Filtering matches by category
      || cmd.category.toLowerCase().indexOf(query) >= 0
  );

  // Structuring our result for Discord's API
  return queryResult
    .map((cmd) => ({
      name: cmd.data.name, value: cmd.data.name
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
} });
