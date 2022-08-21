// Importing from packages
require('dotenv').config();
const logger = require('@mirasaki/logger');
const chalk = require('chalk');
const { Client, GatewayIntentBits, ActivityType, PresenceUpdateStatus } = require('discord.js');

// Local imports
const pkg = require('../package');
const config = require('../config.js');
const { clearSlashCommandData, refreshSlashCommandData } = require('./handlers/commands');
const { getFiles, titleCase, getRuntime, bindDirToCollection } = require('./util');
const path = require('path');
const clientExtensions = require('./client');

// Classes - Alternatively import from ./classes/index
const {
  ChatInputCommand,
  UserContextCommand,
  MessageContextCommand,
  ComponentCommand
} = require('./classes/Commands');

// Clear the console in non-production modes & print vanity
process.env.NODE_ENV !== 'production' && console.clear();
const packageIdentifierStr = `${pkg.name}@${pkg.version}`;
logger.info(`${chalk.greenBright.underline(packageIdentifierStr)} by ${chalk.cyanBright.bold(pkg.author)}`);

// Initializing/declaring our variables
const initTimerStart = process.hrtime.bigint();
const intents = config.intents.map((intent) => GatewayIntentBits[intent]);
const presenceActivityMap = config.presence.activities.map(
  (act) => ({ ...act, type: ActivityType[titleCase(act.type)] })
);

// Building our discord.js client
const client = new Client({
  intents: intents,
  presence: {
    status: PresenceUpdateStatus[config.presence.status] || PresenceUpdateStatus['online'],
    activities: presenceActivityMap
  }
});

// Destructuring from env
const {
  DISCORD_BOT_TOKEN,
  DEBUG_ENABLED,
  CLEAR_SLASH_COMMAND_API_DATA
} = process.env;

// Listen for user requested shutdown
process.on('SIGINT', () => {
  logger.info('\nGracefully shutting down from SIGINT (Ctrl-C)');
  process.exit(0);
});

// Error handling / keep alive - ONLY in production as you shouldn't have any
// unhandledRejection or uncaughtException errors in production
// these should be addressed in development
if (process.env.NODE_ENV !== 'production') {
  process.on('unhandledRejection', (reason, promise) => {
    logger.syserr('Encountered unhandledRejection error (catch):');
    logger.printErr(reason, promise);
  });
  process.on('uncaughtException', (err, origin) => {
    logger.syserr('Encountered uncaughtException error:');
    logger.printErr(err, origin);
  });
}

const registerListeners = () => {
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
};

const bindCommandsToClient = () => {
  const {
    commands,
    contextMenus,
    buttons,
    modals,
    autoCompletes,
    selectMenus
  } = client.container;

  // Binding our Chat Input/Slash commands
  bindDirToCollection('src/commands', ChatInputCommand, commands, 'Chat Input Command');

  // Binding our User Context Menu commands
  bindDirToCollection('src/context-menus/user', UserContextCommand, contextMenus, 'User Context Menu');

  // Binding our Message Context Menu commands
  bindDirToCollection('src/context-menus/message', MessageContextCommand, contextMenus, 'Message Context Menu');

  // Binding our Button interactions
  bindDirToCollection('src/interactions/buttons', ComponentCommand, buttons, 'Button Interaction');

  // Binding our Modal interactions
  bindDirToCollection('src/interactions/modals', ComponentCommand, modals, 'Modal Interaction');

  // Binding our Autocomplete interactions
  bindDirToCollection('src/interactions/autocomplete', ComponentCommand, autoCompletes, 'Auto Complete');

  // Binding our Select Menu interactions
  bindDirToCollection('src/interactions/select-menus', ComponentCommand, selectMenus, 'Select Menu');
};

(async () => {
  // Containerizing? =) all our client extensions
  client.container = clientExtensions;

  // Clear only executes if enabled in .env
  if (CLEAR_SLASH_COMMAND_API_DATA === 'true') {
    clearSlashCommandData();
  }

  // Binding all our components and commands to our client
  bindCommandsToClient();

  // Refresh InteractionCommand data if requested
  refreshSlashCommandData(client);

  // Registering our listeners
  registerListeners();


  /**
   * Finished initializing
   * Performance logging and logging in to our client
   */

  // Execution time logging
  logger.success(`Finished initializing after ${getRuntime(initTimerStart).ms} ms`);

  // Logging in to our client
  client.login(DISCORD_BOT_TOKEN);
})();
