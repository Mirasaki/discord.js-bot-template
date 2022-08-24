// Importing from packages
require('dotenv').config();
const logger = require('@mirasaki/logger');
const chalk = require('chalk');
const { Client, GatewayIntentBits, ActivityType, PresenceUpdateStatus } = require('discord.js');

// Local imports
const pkg = require('../package');
const config = require('../config.js');
const { clearApplicationCommandData, refreshSlashCommandData } = require('./handlers/commands');
const { getFiles, titleCase, getRuntime } = require('./util');
const path = require('path');
const clientExtensions = require('./client');
const { generateCommandHTML } = require('./handlers/html');

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
    console.error(reason, promise);
  });
  process.on('uncaughtException', (err, origin) => {
    logger.syserr('Encountered uncaughtException error:');
    console.error(err, origin);
  });
}

/**
 * Register our listeners using client.on(fileNameWithoutExtension)
 * @private
 */
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

// Use an Immediately Invoked Function Expressions (IIFE) if you need to use await
// In the index.js main function
// (async () => {})();

// Containerizing? =) all our client extensions
client.container = clientExtensions;

// Clear only executes if enabled in .env
if (CLEAR_SLASH_COMMAND_API_DATA === 'true') {
  clearApplicationCommandData();
}

// Destructure from our client extensions container
const {
  commands,
  contextMenus,
  buttons,
  modals,
  autoCompletes,
  selectMenus
} = client.container;

// Binding our Chat Input/Slash commands
const slashCommandDirPath = 'src/commands';
logger.debug(`Start loading Slash Commands... ("${slashCommandDirPath}")`);
for (const filePath of getFiles(slashCommandDirPath)) {
  try {
    const command = require(filePath);
    command.load(filePath, commands);
  } catch (err) {
    logger.syserr(`Error encountered while loading Slash Command (${slashCommandDirPath}), are you sure you're exporting an instance of ChatInputCommand?\nCommand: ${filePath}`);
    console.error(err.stack || err);
  }
}

// Binding our User Context Menu commands
const userCtxMenuCommandDirPath = 'src/context-menus/user';
logger.debug(`Start loading User Context Menu Commands... ("${userCtxMenuCommandDirPath}")`);
for (const filePath of getFiles(userCtxMenuCommandDirPath)) {
  try {
    const command = require(filePath);
    command.load(filePath, contextMenus);
  } catch (err) {
    logger.syserr(`Error encountered while loading User Context Menu Command (${userCtxMenuCommandDirPath}), are you sure you're exporting an instance of UserContextCommand?\nCommand: ${filePath}`);
    console.error(err.stack || err);
  }
}

// Binding our Message Context Menu commands
const messageCtxMenuCommandDirPath = 'src/context-menus/message';
logger.debug(`Start loading Message Context Menu Commands... ("${messageCtxMenuCommandDirPath}")`);
for (const filePath of getFiles(messageCtxMenuCommandDirPath)) {
  try {
    const command = require(filePath);
    command.load(filePath, contextMenus);
  } catch (err) {
    logger.syserr(`Error encountered while loading User Context Menu Command (${messageCtxMenuCommandDirPath}), are you sure you're exporting an instance of MessageContextCommand?\nCommand: ${filePath}`);
    console.error(err.stack || err);
  }
}

// Binding our Button interactions
const buttonCommandDirPath = 'src/interactions/buttons';
logger.debug(`Start loading Button Commands... ("${buttonCommandDirPath}")`);
for (const filePath of getFiles(buttonCommandDirPath)) {
  try {
    const command = require(filePath);
    command.load(filePath, buttons);
  } catch (err) {
    logger.syserr(`Error encountered while loading Button Command (${buttonCommandDirPath}), are you sure you're exporting an instance of ComponentCommand?\nCommand: ${filePath}`);
    console.error(err.stack || err);
  }
}

// Binding our Modal interactions
const modalCommandDirPath = 'src/interactions/modals';
logger.debug(`Start loading Modal Commands... ("${modalCommandDirPath}")`);
for (const filePath of getFiles(modalCommandDirPath)) {
  try {
    const command = require(filePath);
    command.load(filePath, modals);
  } catch (err) {
    logger.syserr(`Error encountered while loading Modal Command (${modalCommandDirPath}), are you sure you're exporting an instance of ComponentCommand?\nCommand: ${filePath}`);
    console.error(err.stack || err);
  }
}

// Binding our Autocomplete interactions
const autoCompleteCommandDirPath = 'src/interactions/autocomplete';
logger.debug(`Start loading Auto Complete Commands... ("${autoCompleteCommandDirPath}")`);
for (const filePath of getFiles(autoCompleteCommandDirPath)) {
  try {
    const command = require(filePath);
    command.load(filePath, autoCompletes);
  } catch (err) {
    logger.syserr(`Error encountered while loading Auto Complete Command (${autoCompleteCommandDirPath}), are you sure you're exporting an instance of ComponentCommand?\nCommand: ${filePath}`);
    console.error(err.stack || err);
  }
}

// Binding our Select Menu interactions
const selectMenuCommandDirPath = 'src/interactions/select-menus';
logger.debug(`Start loading Select Menu Commands... ("${selectMenuCommandDirPath}")`);
for (const filePath of getFiles(selectMenuCommandDirPath)) {
  try {
    const command = require(filePath);
    command.load(filePath, selectMenus);
  } catch (err) {
    logger.syserr(`Error encountered while loading Select Menu Command (${selectMenuCommandDirPath}), are you sure you're exporting an instance of ComponentCommand?\nCommand: ${filePath}`);
    console.error(err.stack || err);
  }
}

// Refresh InteractionCommand data if requested
refreshSlashCommandData(client);

// Registering our listeners
registerListeners();

// All our command and listeners are active
// We can now re-generate and overwrite
// our `html/commands.html` file
generateCommandHTML(commands);

/**
 * Finished initializing
 * Performance logging and logging in to our client
 */

// Execution time logging
logger.success(`Finished initializing after ${getRuntime(initTimerStart).ms} ms`);

// Logging in to our client
client.login(DISCORD_BOT_TOKEN);
