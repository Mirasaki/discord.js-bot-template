const logger = require('@mirasaki/logger');

// Mapping our command names
const HELP = 'help';

// Mapping our commands
const commandMap = [];

// Defining our function to populate our commandMap
// We cant use the "[ ...commands.map() ]" because this is located
// in our top level scope
const populateCommandMap = (commands) => {
  // Looping over all our commands
  for (const cmd of commands) {
    const { config, data } = cmd[1];
    // Checking for command availability
    if (!config.enabled) continue;

    // Pushing the entry to our map if it's available
    commandMap.push({
      name: data.name,
      permLevel: config.permLevel,
      category: data.category,
      globalCmd: config.globalCmd
    });
  }
};

// Destructure from env
const {
  DEBUG_AUTOCOMPLETE_RESPONSE_TIME,
  TEST_SERVER_GUILD_ID
} = process.env;

module.exports = (client, interaction) => {
  // guild property is present and available,
  // we check in the main interactionCreate.js file

  // Check if our 1 time map has been generated
  const { commands } = client.container;
  if (commandMap.length === 0) {
    populateCommandMap(commands);
  }

  // Destructure from interaction
  const {
    guild,
    commandName,
    member
  } = interaction;

  // Get our command name query
  const query = interaction.options.getFocused()?.toLowerCase() || '';


  // Start our timer for performance logging
  const autoResponseQueryStart = process.hrtime();

  // Initialize an empty result
  let result = [];

  // Ignore the eslint rule
  // The reason is that this switch case is setting up for any future commands
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (commandName) {
    // Handle our Help command auto complete
    case HELP: {
      // Filtering out unusable commands
      const workingCmdMap = commandMap.filter(
        (cmd) => member.permLevel >= cmd.permLevel
        // Filtering out test commands
        && (
          cmd.globalCmd === true
            ? true
            : guild.id === TEST_SERVER_GUILD_ID
        )
      );

      // Getting our search query's results
      const queryResult = workingCmdMap.filter(
        (cmd) =>
          // Filtering matches by name
          cmd.name.toLowerCase().indexOf(query) >= 0
          // Filtering matches by category
          || cmd.category.toLowerCase().indexOf(query) >= 0
      );

      // Structuring our result for Discord's API
      result = queryResult
        .map(cmd => {
          return {
            name: cmd.name,
            value: cmd.name
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      // Finish our switch case entry
      break;
    }

    // Unknown auto complete interaction
    // Default result is an empty array
    default: {
      logger.debug(`Unknown AutoCompleteInteraction received. Command: ${commandName} - returning empty array as response`);
      break;
    }
  }

  // Returning our query result
  interaction.respond(
    // Slicing of the first 25 results, which is max allowed by Discord
    result?.slice(0, 25) || []
  ).catch((err) => {
    // Unknown Interaction Error
    if (err.code === 10062) {
      logger.debug(`Error code 10062 (UNKNOWN_INTERACTION) encountered while responding to autocomplete query in ${commandName} - this interaction probably expired.`);
    }

    // Handle unexpected errors
    else {
      logger.syserr(`Unknown error encountered while responding to autocomplete query in ${commandName}`);
      logger.printErr(err);
    }
  });

  // Performance logging if requested depending on environment
  if (DEBUG_AUTOCOMPLETE_RESPONSE_TIME === 'true') {
    logger.debug(`Responded to "${query}" auto-complete query in ${logger.getExecutionTime(autoResponseQueryStart)}`);
  }
};
