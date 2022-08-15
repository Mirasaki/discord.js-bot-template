// Importing from packages
require('dotenv').config();
const logger = require('@mirasaki/logger');
const chalk = require('chalk');
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');

// Local imports
const pkg = require('../package');
const config = require('../config.js');
const emojis = require('./config/emojis');
const colors = require('./config/colors');
const { clearSlashCommandData, refreshSlashCommandData, bindCommandsToClient } = require('./handlers/commands');
const { titleCase, getFiles } = require('./util');
const path = require('path');

// Clear the console in non-production modes & printing vanity
process.env.NODE_ENV !== 'production' && console.clear();
const packageIdentifierStr = `${pkg.name}@${pkg.version}`;
logger.info(`${chalk.greenBright.underline(packageIdentifierStr)} by ${chalk.cyanBright.bold(pkg.author)}`);

// Initializing/declaring our variables
const initTimerStart = process.hrtime();
const intents = config.intents.map((intent) => GatewayIntentBits[titleCase(intent)]);
const presenceActivityMap = config.presence.activities.map(
  (act) => ({ ...act, type: ActivityType[act.type] })
);

// Building our discord.js client
const client = new Client({
  intents: intents,
  presence: {
    status: config.presence.status,
    activities: presenceActivityMap
  }
});

// Destructuring from env
const {
  DISCORD_BOT_TOKEN,
  DEBUG_ENABLED,
  CLEAR_SLASH_COMMAND_API_DATA
} = process.env;

(async () => {
  // Containering?=) all our client extensions
  client.container = {
    commands: new Collection(),
    config,
    emojis,
    colors
  };

  // Calling required functions
  bindCommandsToClient(client);

  // Clear only executes if enabled in .env
  if (CLEAR_SLASH_COMMAND_API_DATA === 'true') {
    clearSlashCommandData();
  }

  // Refresh InteractionCommand data if requested
  refreshSlashCommandData(client);

  // Registering our listeners
  const eventFiles = getFiles('src/listeners', '.js');
  const eventNames = eventFiles.map((filePath) => filePath.slice(
    filePath.lastIndexOf(path.sep) + 1,
    filePath.lastIndexOf('.')
  ));

  // Debug logging
  if (DEBUG_ENABLED === 'true') {
    logger.debug(`Registering ${eventFiles.length} listeners: ${eventNames.map((name) => chalk.whiteBright(name)).join(', ')}`);
  }

  // Looping over our event files
  for (const filePath of eventFiles) {
    const eventName = filePath.slice(
      filePath.lastIndexOf(path.sep) + 1,
      filePath.lastIndexOf('.')
    );

    // Binding our event to the client
    const eventFile = require(filePath);
    client.on(eventName, (...received) => eventFile(client, ...received));
  }

  // Execution time logging
  logger.success(`Finished initializing after ${logger.getExecutionTime(initTimerStart)}`);

  // Logging in to our client
  client.login(DISCORD_BOT_TOKEN);
})();

// Listen for user requested shutdown
process.on('SIGINT', () => {
  logger.info('\nGracefully shutting down from SIGINT (Ctrl-C)');
  process.exit(0);
});
