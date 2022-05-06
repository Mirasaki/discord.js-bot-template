// Require dependencies
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const logger = require('@mirasaki/logger');
const chalk = require('chalk');
const path = require('path');
const { getFiles } = require('../util');
const { permConfig } = require('./permissions');

// Destructure from process.env
const {
  CLEAR_SLASH_COMMAND_API_DATA,
  DISCORD_BOT_TOKEN,
  CLIENT_ID,
  TEST_SERVER_GUILD_ID,
  DEBUG_ENABLED,
  REFRESH_SLASH_COMMAND_API_DATA,
  NODE_ENV,
  DEBUG_SLASH_COMMAND_API_DATA
} = process.env;

// Initializing our REST client
const rest = new REST({ version: '10' })
  .setToken(DISCORD_BOT_TOKEN);

// Utility function for clearing our Slash Command Data
const clearSlashCommandData = () => {
  if (CLEAR_SLASH_COMMAND_API_DATA === 'true') {
    logger.info('Clearing ApplicationCommand API data');
    rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, TEST_SERVER_GUILD_ID), { body: [] });
    logger.success(
      'Successfully reset all Slash Commands. It may take up to an hour for global changes to take effect.'
    );
  }
};

const bindCommandsToClient = (client) => {
  // Destructuring commands from our client container
  const { commands } = client.container;
  const topLevelCommandFolder = path.join('src', 'commands');

  // Looping over every src/commands/ file
  for (const commandPath of getFiles(topLevelCommandFolder, '.js', '.mjs', '.cjs')) {
    // Require our command module
    let cmdModule = require(commandPath);
    // Adding the filepath/origin onto the module
    cmdModule.filePath = commandPath;
    // Validating the command
    cmdModule = validateCmdConfig(cmdModule);

    // Debug Logging
    if (DEBUG_ENABLED === 'true') {
      logger.debug(`Loading the <${chalk.cyanBright(cmdModule.data.name)}> command`);
    }

    // Set the command in client.container.commands[x]
    commands.set(cmdModule.data.name, cmdModule);
  }
};

// Utility function for refreshing our InteractionCommand API data
const refreshSlashCommandData = (client) => {
  // Mapping our commands
  const commandData = client.container.commands.map((e) => e.data);

  // Extensive debug logging
  if (DEBUG_SLASH_COMMAND_API_DATA === 'true') {
    logger.startLog('Application Command Data');
    console.table(commandData);
    logger.endLog('Application Command Data');
  }

  // Environmental skip
  if (REFRESH_SLASH_COMMAND_API_DATA !== 'true') {
    logger.syslog(`Skipping application ${chalk.white('(/)')} commands refresh.`);
    return;
  }

  try {
    logger.info(`Started refreshing application ${chalk.white('(/)')} commands.`);

    // Global Slash commands in production
    if (NODE_ENV === 'production') {
      logger.info('[production] Registering Application Commands as global');
      rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commandData }
      );
    }

    // Guild Commands otherwise
    else {
      rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, TEST_SERVER_GUILD_ID),
        { body: commandData }
      );
    }

    logger.success(`Successfully reloaded application ${chalk.white('(/)')} commands.`);
  } catch (error) {
    logger.syserr(`Error while refreshing application ${chalk.white('(/)')} commands`);
    console.error(error);
  }
};

class Command {
  constructor ({ config, data, filePath }) {
    this.config = {
      // Permissions
      permLevel: permConfig[0].name,
      clientPerms: [],
      userPerms: [],

      // Status
      globalCmd: false,
      testServerCmd: true,
      additionalServerIds: [],
      nsfw: true,

      // Command Cooldown
      cooldown: {
        usages: 1,
        duration: 2
      },

      ...config
    };

    this.data = {
      name: filePath.slice(
        filePath.lastIndexOf(path.sep) + 1,
        filePath.lastIndexOf('.')
      ),
      category: filePath.slice(
        filePath.lastIndexOf(path.sep, filePath.lastIndexOf(path.sep) - 1) + 1,
        filePath.lastIndexOf(path.sep)
      ),
      ...data
    };
  }
}

const validateCmdConfig = (cmd) => {
  // Default values
  cmd = new Command(cmd);

  // Check if the config object is defined
  if ('config' in cmd) {
    // Destructure
    const { config, data } = cmd;

    // Check if valid permission level is supplied
    const { permLevel } = config;
    if (!permConfig.find((e) => e.name === permLevel)) {
      throw new Error(`The permission level "${permLevel}" is not currently configured.\nCommand: ${data.name}`);
    }

    // Check that optional client permissions are valid
    if (config.permissions?.client) {
      const { client } = config.permissions;
      if (!Array.isArray(client)) {
        throw new Error (`Invalid permissions provided in ${data.name} command client permissions\nCommand: ${data.name}`);
      }
    }

    // Check that optional user permissions are valid
    if (config.permissions?.user) {
      const { user } = config.permissions;
      if (!Array.isArray(user)) {
        throw new Error (`Invalid permissions provided in ${data.name} command user permissions\nCommand: ${data.name}`);
      }
    }

    // Util for code repetition
    const throwBoolErr = (key) => {
      throw new Error(`Expected boolean at config.${key}\nCommand: ${data.name}`);
    };

    // Check our required boolean values
    if (typeof config.globalCmd !== 'boolean') throwBoolErr('globalCmd');
    if (typeof config.testServerCmd !== 'boolean') throwBoolErr('testServerCmd');
    if (typeof config.nsfw !== 'boolean') throwBoolErr('nsfw');

    // Check addionalServerIds
    if (!Array.isArray(config.additionalServerIds)) {
      throw new Error(`Expected array at config.additionalServerIds\nCommand: ${data.name}`);
    }
  }

  // Description is required
  if (!cmd.data?.description) {
    throw new Error(`An InteractionCommand description is required by Discord's API\nCommand: ${cmd.data.name}`);
  }

  return cmd;
};

module.exports = {
  clearSlashCommandData,
  refreshSlashCommandData,
  bindCommandsToClient,
  validateCmdConfig
};
