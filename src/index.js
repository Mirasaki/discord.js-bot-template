// Importing from packages
require('dotenv').config();
const logger = require('@mirasaki/logger');
const chalk = require('chalk');
const { Client, GatewayIntentBits, ActivityType, PresenceUpdateStatus } = require('discord.js');

// Local imports
const pkg = require('../package');
const config = require('../config.js');
const { clearSlashCommandData, refreshSlashCommandData } = require('./handlers/commands');
const { getFiles, titleCase, getRuntime } = require('./util');
const path = require('path');
const clientExtensions = require('./client');

// Classes - Alternatively import from ./classes/index
const ChatInputCommand = require('./classes/commands/ChatInputCommand');
const UserContextCommand = require('./classes/commands/UserContextCommand');
const MessageContextCommand = require('./classes/commands/MessageContextCommand');
const ComponentCommand = require('./classes/commands/ComponentCommand');

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

// eslint-disable-next-line sonarjs/cognitive-complexity
(async () => {
  // Containerizing? =) all our client extensions
  client.container = clientExtensions;
  const {
    commands,
    contextMenus,
    buttons,
    modals,
    autoCompletes,
    selectMenus
  } = client.container;

  /**
   * ChatInput, UserContextMenu and MessageContextMenu commands
   */

  // Binding our Chat Input/Slash commands
  for (const filePath of getFiles(
    path.join('src', 'commands'),
    ['.js', '.mjs', '.cjs'])
  ) {
    // Require as module
    const module = require(filePath);
    // Calling the class constructor
    const command = new ChatInputCommand({ ...module, filePath });

    // Debug Logging
    if (DEBUG_ENABLED === 'true') {
      logger.debug(`${chalk.black('[Chat Input Command]')} Loading <${chalk.cyanBright(command.data.name)}>`);
    }

    // Set the command in our command collection
    commands.set(command.data.name, command);
  }

  // Binding our User Context Menu commands
  for (const filePath of getFiles(
    path.join('src', 'context-menus', 'user'),
    ['.js', '.mjs', '.cjs'])
  ) {
    const module = require(filePath);
    const command = new UserContextCommand({ ...module, filePath });
    if (DEBUG_ENABLED === 'true') logger.debug(`${chalk.black('[User Context Menu]')} Loading <${chalk.cyanBright(command.data.name)}>`);
    contextMenus.set(command.data.name, command);
  }

  // Binding our Message Context Menu commands
  for (const filePath of getFiles(
    path.join('src', 'context-menus', 'message'),
    ['.js', '.mjs', '.cjs'])
  ) {
    const module = require(filePath);
    const command = new MessageContextCommand({ ...module, filePath });
    if (DEBUG_ENABLED === 'true') logger.debug(`${chalk.black('[Message Context Menu]')} Loading <${chalk.cyanBright(command.data.name)}>`);
    contextMenus.set(command.data.name, command);
  }

  // Clear only executes if enabled in .env
  if (CLEAR_SLASH_COMMAND_API_DATA === 'true') {
    clearSlashCommandData();
  }

  // Refresh InteractionCommand data if requested
  refreshSlashCommandData(client);

  /**
   * Components
   * Buttons, Modals, Autocomplete, etc etc
   */

  // Binding our Button interactions
  for (const filePath of getFiles(
    path.join('src', 'interactions', 'buttons'),
    ['.js', '.mjs', '.cjs'])
  ) {
    const module = require(filePath);
    const command = new ComponentCommand({ ...module, filePath });
    if (DEBUG_ENABLED === 'true') logger.debug(`${chalk.black('[Button Command]')} Loading <${chalk.cyanBright(command.data.name)}>`);
    buttons.set(command.data.name, command);
  }

  // Binding our Modal interactions
  for (const filePath of getFiles(
    path.join('src', 'interactions', 'modals'),
    ['.js', '.mjs', '.cjs'])
  ) {
    const module = require(filePath);
    const command = new ComponentCommand({ ...module, filePath });
    if (DEBUG_ENABLED === 'true') logger.debug(`${chalk.black('[Modal Command]')} Loading <${chalk.cyanBright(command.data.name)}>`);
    modals.set(command.data.name, command);
  }

  // Binding our Autocomplete interactions
  for (const filePath of getFiles(
    path.join('src', 'interactions', 'autocomplete'),
    ['.js', '.mjs', '.cjs'])
  ) {
    const module = require(filePath);
    const command = new ComponentCommand({ ...module, filePath });
    if (DEBUG_ENABLED === 'true') logger.debug(`${chalk.black('[AutoComplete Query]')} Loading <${chalk.cyanBright(command.data.name)}>`);
    autoCompletes.set(command.data.name, command);
  }

  // Binding our Select Menu interactions
  for (const filePath of getFiles(
    path.join('src', 'interactions', 'select-menus'),
    ['.js', '.mjs', '.cjs'])
  ) {
    const module = require(filePath);
    const command = new ComponentCommand({ ...module, filePath });
    if (DEBUG_ENABLED === 'true') logger.debug(`${chalk.black('[Select Menu]')} Loading <${chalk.cyanBright(command.data.name)}>`);
    selectMenus.set(command.data.name, command);
  }

  /**
   * Events / Listeners
   */

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


  /**
   * Finished initializing
   * Performance logging and logging in to our client
   */

  // Execution time logging
  logger.success(`Finished initializing after ${getRuntime(initTimerStart).ms} ms`);

  // Logging in to our client
  client.login(DISCORD_BOT_TOKEN);
})();

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
