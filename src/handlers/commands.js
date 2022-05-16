// Require dependencies
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const logger = require('@mirasaki/logger');
const chalk = require('chalk');
const path = require('path');
const { getFiles, titleCase } = require('../util');
const { permConfig, getInvalidPerms, permLevelMap } = require('./permissions');
const emojis = require('../../config/emojis.json');

// Destructure from process.env
const {
  CLEAR_SLASH_COMMAND_API_DATA,
  DISCORD_BOT_TOKEN,
  CLIENT_ID,
  TEST_SERVER_GUILD_ID,
  DEBUG_ENABLED,
  REFRESH_SLASH_COMMAND_API_DATA,
  DEBUG_SLASH_COMMAND_API_DATA
} = process.env;

// Defining our command class for value defaults
class Command {
  constructor ({ config, data, filePath, run }) {
    this.config = {
      // Permissions
      permLevel: permConfig[0].name,
      clientPerms: [],
      userPerms: [],

      // Status
      enabled: true,
      globalCmd: false,
      testServerCmd: true,
      nsfw: false,

      // Command Cooldown
      cooldown: {
        usages: 1,
        duration: 2
      },

      ...config
    };

    this.data = {
      // Default = file name without extension
      name: filePath.slice(
        filePath.lastIndexOf(path.sep) + 1,
        filePath.lastIndexOf('.')
      ),
      // Default = file parent folder name
      category: filePath.slice(
        filePath.lastIndexOf(path.sep, filePath.lastIndexOf(path.sep) - 1) + 1,
        filePath.lastIndexOf(path.sep)
      ),
      ...data
    };

    this.run = run;

    // Transforms the permLevel into an integer
    this.setPermLevel = () => {
      this.config.permLevel = Number(
        Object.entries(permLevelMap)
          .find(([lvl, name]) => name === this.config.permLevel)[0]
      );
    };
  }
}


// Initializing our REST client
const rest = new REST({ version: '10' })
  .setToken(DISCORD_BOT_TOKEN);

// Utility function for clearing our Slash Command Data
const clearSlashCommandData = () => {
  if (CLEAR_SLASH_COMMAND_API_DATA === 'true') {
    logger.info('Clearing ApplicationCommand API data');
    rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, TEST_SERVER_GUILD_ID), { body: [] })
      .catch((err) => {
        // Catching Missing Access error
        logger.syserr('Error encountered while trying to clear GuildCommands in the test server, this probably means your TEST_SERVER_GUILD_ID in the config/.env file is invalid or the client isn\'t currently in that server');
        logger.syserr(err);
      });
    logger.success(
      'Successfully reset all Slash Commands. It may take up to an hour for global changes to take effect.'
    );
    logger.syslog(chalk.redBright('Shutting down...'));
    process.exit(1);
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

    // Transforming the string permission into an integer
    cmdModule.setPermLevel();

    // Debug Logging
    if (DEBUG_ENABLED === 'true') {
      logger.debug(`Loading the <${chalk.cyanBright(cmdModule.data.name)}> command`);
    }

    // Set the command in client.container.commands[x]
    commands.set(cmdModule.data.name, cmdModule);
  }
};

// Utility function for sorting the commands
const sortCommandsByCategory = (commands) => {
  let currentCategory = '';
  const sorted = [];
  commands.forEach(cmd => {
    const workingCategory = titleCase(cmd.data.category);
    if (currentCategory !== workingCategory) {
      sorted.push({
        category: workingCategory,
        commands: [cmd]
      });
      currentCategory = workingCategory;
    } else sorted.find(e => e.category === currentCategory).commands.unshift(cmd);
  });
  return sorted;
};

// Utility function for refreshing our InteractionCommand API data
const refreshSlashCommandData = (client) => {
  // Environmental skip
  if (REFRESH_SLASH_COMMAND_API_DATA !== 'true') {
    logger.syslog(`Skipping application ${chalk.white('(/)')} commands refresh.`);
    return;
  }

  try {
    logger.startLog(`Refreshing Application ${chalk.white('(/)')} Commands.`);

    // Handle our different cmd config setups
    registerGlobalCommands(client); // Global Slash Command
    registerTestServerCommands(client); // Test Server Commands

    logger.endLog(`Refreshing Application ${chalk.white('(/)')} Commands.`);
  } catch (error) {
    logger.syserr(`Error while refreshing application ${chalk.white('(/)')} commands`);
    console.error(error);
  }
};

// Registering our global commands
const registerGlobalCommands = async (client) => {
  // Logging
  logger.info('Registering Global Application Commands');

  // Defining our variables
  const { commands } = client.container;
  const globalCommandData = commands
    .filter((cmd) =>
      cmd.config.globalCmd === true
      && cmd.config.enabled === true
    )
    .map((cmd) => cmd.data);

  // Extensive debug logging
  if (DEBUG_SLASH_COMMAND_API_DATA === 'true') {
    logger.startLog('Global Command Data');
    console.table(globalCommandData);
    logger.endLog('Global Command Data');
  }

  // Sending the global command data
  rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: globalCommandData }
  );
};

// Registering our Test Server commands
const registerTestServerCommands = (client) => {
  // Defining our variables
  const { commands } = client.container;
  const testServerCommandData = commands
    .filter((cmd) =>
      cmd.config.globalCmd === false // Filter out global commands
      && cmd.config.testServerCmd === true
      && cmd.config.enabled === true
    )
    .map((cmd) => cmd.data);

  // Return if there's no test command data
  if (testServerCommandData.length === 0) {
    return true;
  }

  // Logging
  logger.info('Registering Test Server Commands');

  // Extensive debug logging
  if (DEBUG_SLASH_COMMAND_API_DATA === 'true') {
    logger.startLog('Test Server Command Data');
    console.table(testServerCommandData);
    logger.endLog('Test Server Command Data');
  }

  // Sending the test server command data
  rest.put(
    Routes.applicationGuildCommands(
      CLIENT_ID,
      TEST_SERVER_GUILD_ID // Providing our test server id
    ),
    { body: testServerCommandData }
  ).catch((err) => {
    // Catching Missing Access error
    logger.syserr('Error encountered while trying to register GuildCommands in the test server, this probably means your TEST_SERVER_GUILD_ID in the config/.env file is invalid or the client isn\'t currently in that server');
    logger.syserr(err);
  });
};

// Disable our eslint rule
// The function isn't complex, just long
// eslint-disable-next-line sonarjs/cognitive-complexity
const validateCmdConfig = (cmd) => {
  // Default values
  cmd = new Command(cmd);

  // Destructure
  const { config, data, run } = cmd;

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

  // Description is required
  if (!data?.description) {
    throw new Error(`An InteractionCommand description is required by Discord's API\nCommand: ${data.name}`);
  }

  // Check our run function
  if (typeof run !== 'function') {
    throw new Error(`Expected run to be a function, but received ${typeof run}\nCommand: ${data.name}`);
  }

  // Check optional required client permissions
  if (config.clientPerms.length >= 1) {
    const invalidPerms = getInvalidPerms(config.clientPerms).map(e => chalk.red(e));
    if (invalidPerms.length >= 1) {
      throw new Error(`Invalid permissions provided in config.clientPerms: ${invalidPerms.join(', ')}\nCommand: ${data.name}`);
    }
  }

  // Check optional required user permissions
  if (config.userPerms.length >= 1) {
    const invalidPerms = getInvalidPerms(config.userPerms).map(e => chalk.red(e));
    if (invalidPerms.length >= 1) {
      throw new Error(`Invalid permissions provided in config.userPerms: ${invalidPerms.join(', ')}\nCommand: ${data.name}`);
    }
  }

  // Return the valid command module
  return cmd;
};

// Handling command cooldowns
const ThrottleMap = new Map();
const throttleCommand = (cmd, id) => {
  const { config, data: cmdData } = cmd;
  const { cooldown } = config;
  if (cooldown === false) return false;
  const cmdCd = parseInt(cooldown.duration * 1000);
  if (!cmdCd || cmdCd < 0) return false;

  const identifierString = `${id}-${cmd}`;

  // No data
  if (!ThrottleMap.has(identifierString)) {
    ThrottleMap.set(identifierString, [Date.now()]);
    setTimeout(() => ThrottleMap.delete(identifierString), cmdCd);
    return false;
  }

  // Data was found
  else {
    const data = ThrottleMap.get(identifierString);
    const nonExpired = data.filter((timestamp) => Date.now() < (timestamp + cmdCd));

    // Currently on cooldown
    if (nonExpired.length >= cooldown.usages) {
      return `${emojis.error} {{user}}, you can use **\`/${cmdData.name}\`** again in ${
        Number.parseFloat(((nonExpired[0] + cmdCd) - Date.now()) / 1000).toFixed(2)
      } seconds`;
    }

    // Not on max-usages yet, increment
    else {
      data.push(Date.now());
      return false;
    }
  }
};

module.exports = {
  clearSlashCommandData,
  refreshSlashCommandData,
  bindCommandsToClient,
  validateCmdConfig,
  sortCommandsByCategory,
  throttleCommand
};
