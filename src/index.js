// Importing from packages
require('dotenv').config({ path: 'config/.env' });
const logger = require('@mirasaki/logger');
const chalk = require('chalk');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

// Local imports
const pkg = require('../package');
const config = require('../config/config');
const emojis = require('../config/emojis');
const colors = require('../config/colors');
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
const client = new Client({
  intents: intents,
  presence: config.presence
});

// Destructuring from env
const {
  DISCORD_BOT_TOKEN,
  DEBUG_ENABLED
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
  clearSlashCommandData();

  // Refresh InteractionCommand data if requested
  refreshSlashCommandData(client);

  // Registering our listeners
  const eventFiles = getFiles('src/listeners', '.js');
  for (const filePath of eventFiles) {
    const eventName = filePath.slice(
      filePath.lastIndexOf(path.sep) + 1,
      filePath.lastIndexOf('.')
    );

    // Debug logging
    if (DEBUG_ENABLED === 'true') {
      logger.debug(`Registering ${chalk.whiteBright(eventName)} listener...`);
    }

    // Binding our event to the client
    const eventFile = require(filePath);
    client.on(eventName, (...received) => eventFile(client, ...received));
  }

  // Execution time logging
  logger.success(`Finished initializing after ${logger.getExecutionTime(initTimerStart)}`);

  // Logging in to our client
  client.login(DISCORD_BOT_TOKEN);
})();
