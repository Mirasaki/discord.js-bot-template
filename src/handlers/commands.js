/* eslint-disable sonarjs/cognitive-complexity */

// Require dependencies
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

// Local imports
const { titleCase, splitCamelCaseStr, colorResolver } = require('../util');
const emojis = require('../config/emojis.json');

// Packages
const logger = require('@mirasaki/logger');
const chalk = require('chalk');
const { hasChannelPerms } = require('./permissions');
const { commands, colors } = require('../client');
const {
  SELECT_MENU_MAX_OPTIONS,
  HELP_SELECT_MENU_SEE_MORE_OPTIONS,
  HELP_COMMAND_SELECT_MENU,
  MS_IN_ONE_SECOND
} = require('../constants');
const {
  ActionRowBuilder,
  SelectMenuBuilder,
  PermissionsBitField
} = require('discord.js');

// Destructure from process.env
const {
  DISCORD_BOT_TOKEN,
  CLIENT_ID,
  TEST_SERVER_GUILD_ID,
  REFRESH_SLASH_COMMAND_API_DATA,
  DEBUG_SLASH_COMMAND_API_DATA,
  DEBUG_COMMAND_THROTTLING
} = process.env;

// Initializing our REST client
const rest = new REST({ version: '10' })
  .setToken(DISCORD_BOT_TOKEN);

// Utility function for clearing our Slash Command Data
const clearSlashCommandData = () => {
  logger.info('Clearing ApplicationCommand API data');
  rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
  rest.put(Routes.applicationGuildCommands(CLIENT_ID, TEST_SERVER_GUILD_ID), { body: [] })
    .catch((err) => {
      // Catching Missing Access error
      logger.syserr('Error encountered while trying to clear GuildCommands in the test server, this probably means your TEST_SERVER_GUILD_ID in the .env file is invalid or the client isn\'t currently in that server');
      logger.syserr(err);
    });
  logger.success(
    'Successfully reset all Slash Commands. It may take up to an hour for global changes to take effect.'
  );
  logger.syslog(chalk.redBright('Shutting down...'));
  process.exit(1);
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

// Interaction Command Type Map
const apiCommandTypeList = {
  1: 'Slash Command',
  2: 'User Context Menu',
  3: 'Message Context Menu'
};

// Logging the api data to the console using console.table
const logCommandApiData = (cmdData) => {
  // Filtering out stuff we don't need and formatting
  const cleanedObjArr = cmdData.map(
    (data) => ({
      name: data.name,
      description: data.description || 'n/a',
      category: data.category,
      options: data.options?.length || 0,
      type: apiCommandTypeList[data.type]
    })
  );
  console.table(cleanedObjArr);
};

// Registering our global commands
const registerGlobalCommands = async (client) => {
  // Logging
  logger.info('Registering Global Application Commands');

  // Defining our variables
  const { commands, contextMenus } = client.container;
  const combinedData = commands.concat(contextMenus);
  const globalCommandData = combinedData
    .filter((cmd) =>
      cmd.config.globalCmd === true
      && cmd.config.enabled === true
    )
    .map((cmd) => cmd.data);

  // Extensive debug logging
  if (DEBUG_SLASH_COMMAND_API_DATA === 'true') {
    logger.startLog('Global Command Data');
    logCommandApiData(globalCommandData);
    logger.endLog('Global Command Data');
  }

  // Sending the global command data
  rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: globalCommandData }
  ).catch((err) => {
    // Invalid Form Body error
    if (err.status === 400) {
      logger.syserr(`Error encountered while trying to register command API data: ${err.message}`);
      for (const [ index ] in err.rawError.errors) {
        // Logging the invalid data to the console
        console.log(err.requestBody.json[Number(index)]);
      }
    }

    else {
      // Unknown errors
      logger.syserr(err);
    }
  });
};

// Registering our Test Server commands
const registerTestServerCommands = (client) => {
  // Defining our variables
  const { commands, contextMenus } = client.container;
  const combinedData = commands.concat(contextMenus);
  const testServerCommandData = combinedData
    .filter((cmd) =>
      cmd.config.globalCmd === false // Filter out global commands
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
    logger.startLog('Test Server Command Data | Only active on the server defined in your .env file');
    logCommandApiData(testServerCommandData);
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
    // Invalid TEST_SERVER_GUILD_ID
    if (err.status === 404) {
      logger.syserr('Error encountered while trying to register GuildCommands in the test server, this probably means your TEST_SERVER_GUILD_ID in the .env file is invalid or the client isn\'t currently in that server');
      logger.printErr(err.stack || err);
    }

    // Invalid Form Body error
    else if (err.status === 400) {
      logger.syserr(`Error encountered while trying to register GuildCommands in the test server: ${err.message}`);
      for (const [ index ] in err.rawError.errors) {
        // Logging the invalid data to the console
        console.log(err.requestBody.json[Number(index)]);
      }
    }

    else {
      // Catching Missing Access error
      logger.printErr(err);
    }
  });
};

// return a unique id depending on cooldown type
const getThrottleId = (cooldown, data, interaction) => {
  // Destructure from interaction
  const { member, channel, guild } = interaction;

  // Building our unique identifier string
  let identifierStr;
  switch (cooldown.type) {
    case 'member': identifierStr = `${member.id}${guild.id}`; break;
    case 'guild': identifierStr = guild.id; break;
    case 'channel': identifierStr = channel.id; break;
    case 'global': identifierStr = ''; break;

    // By default only use member.id
    case 'user':
    default: {
      identifierStr = member.id;
      break;
    }
  }

  // Append the command name to the identifier string
  identifierStr += `-${data.name}`;

  // return the uid
  return identifierStr;
};

// Handling command cooldown
const ThrottleMap = new Map();
const throttleCommand = (clientCmd, interaction) => {
  const { config, data } = clientCmd;
  const { cooldown } = config;
  const debugStr = chalk.red('[Cmd Throttle]');

  // Check if a cooldown is configured
  if (cooldown === false) {
    if (DEBUG_COMMAND_THROTTLING === 'true') {
      logger.debug(`${debugStr} - ${data.name} No cooldown configured.`);
    }
    return false;
  }

  // Check if cooldown is valid
  const cooldownInMS = parseInt(cooldown.duration * MS_IN_ONE_SECOND);
  if (!cooldownInMS || cooldownInMS < 0) {
    if (DEBUG_COMMAND_THROTTLING === 'true') {
      logger.debug(`${debugStr} - ${data.name} No cooldown configured.`);
    }
    return false;
  }

  // Get our command throttle id
  const identifierStr = getThrottleId(cooldown, data, interaction);

  // Debug logging
  if (DEBUG_COMMAND_THROTTLING === 'true') {
    logger.debug(`${debugStr} - ${chalk.green(identifierStr)} UID Applied to ${chalk.blue(data.name)} with cooldown type ${chalk.red(cooldown.type)}`);
  }

  // No data
  if (!ThrottleMap.has(identifierStr)) {
    // Additional debug logging
    if (DEBUG_COMMAND_THROTTLING === 'true') {
      logger.debug(`${debugStr} - ${chalk.green(identifierStr)} ThrottleMap data created, pushed this usage. Cooldown expires in ${cooldown.duration} seconds`);
    }
    ThrottleMap.set(identifierStr, [Date.now()]);
    setTimeout(() => {
      if (DEBUG_COMMAND_THROTTLING === 'true') {
        logger.debug(`${debugStr} - ${chalk.green(identifierStr)} ThrottleMap data expired, removed this usage.`);
      }
      ThrottleMap.delete(identifierStr);
    }, cooldownInMS);
    return false;
  }

  // Data was found
  else {
    const throttleData = ThrottleMap.get(identifierStr);
    const nonExpired = throttleData.filter((timestamp) => Date.now() < (timestamp + cooldownInMS));

    // Return - Currently on cooldown
    if (nonExpired.length >= cooldown.usages) {
      if (DEBUG_COMMAND_THROTTLING === 'true') {
        logger.debug(`${debugStr} - ${chalk.green(identifierStr)} Command is actively being throttled, returning.`);
      }
      return `${emojis.error} {{user}}, you can use **\`/${data.name}\`** again in ${
        Number.parseFloat(((nonExpired[0] + cooldownInMS) - Date.now()) / MS_IN_ONE_SECOND).toFixed(2)
      } seconds`;
    }

    // Not on max-usages yet, increment usages
    else {
      if (DEBUG_COMMAND_THROTTLING === 'true') {
        logger.debug(`${debugStr} - ${chalk.green(identifierStr)} Incremented usage`);
      }
      throttleData.push(Date.now());
      return false;
    }
  }
};

// Utility function for running all the checks that have to pass
// In order to execute the command
const checkCommandCanExecute = (client, interaction, clientCmd) => {
  // Required destructuring
  const { member, channel } = interaction;
  const { emojis } = client.container;
  const { config, data } = clientCmd;

  // Get permission levels
  const commandPermLvl = config.permLevel;

  // Check if the command is currently disabled
  // Needed 'cuz it takes a while for CommandInteractions to sync across server
  if (config.enabled === false) {
    interaction.reply({
      content: `${emojis} ${member}, this command is currently disabled. Please try again later.`
    });
    return false;
  }

  // Fallback for unexpected results
  if (isNaN(commandPermLvl)) {
    interaction.reply({
      content: `${emojis.error} ${member}, something went wrong while using this command.\n${emojis.info} This issue has been logged to the developer.\n${emojis.wait} Please try again later`,
      ephemeral: true
    });
    logger.syserr(`Interaction returned: Calculated permission level for command ${data.name} is NaN.`);
    return false;
  }

  // Check if they have the required permission level
  if (member.permLevel < commandPermLvl) {
    interaction.reply({
      content: `${emojis.error} ${member}, you do not have the required permission level to use this command.`
    });
    return false;
  }

  // Check for missing client Discord App permissions
  if (config.clientPerms.length !== 0) {
    const missingPerms = hasChannelPerms(client.user.id, channel, config.clientPerms);
    if (missingPerms !== true) {
      interaction.reply({
        content: `${emojis.error} ${member}, this command can't be executed because I lack the following permissions in ${channel}\n${emojis.separator} ${missingPerms.join(', ')}`
      });
      return false;
    }
  }

  // Check for missing user Discord App permissions
  if (config.userPerms.length !== 0) {
    const missingPerms = hasChannelPerms(member.user.id, channel, config.userPerms);
    if (missingPerms !== true) {
      interaction.reply({
        content: `${emojis.error} ${member}, this command can't be executed because you lack the following permissions in ${channel}:\n${emojis.separator} ${missingPerms.join(', ')}`
      });
      return false;
    }
  }

  // Check for NSFW commands and channels
  if (config.nsfw === true && channel.nsfw !== true) {
    interaction.reply({
      content: `${emojis.error} ${member}, that command is marked as **NSFW**, you can't use it in a **SFW** channel!`,
      ephemeral: true
    });
    return false;
  }

  // All checks have passed
  return true;
};

// Checks if the member has access to the component command
const hasAccessToComponentCommand = (interaction) => {
  const { member, message } = interaction;
  const originInteractionUserId = message.interaction.user?.id;
  return member.id === originInteractionUserId;
};

// Define a filter to check if a command applies to the member
const isAppropriateCommandFilter = (member, cmd) =>
  // Check permission level
  member.permLevel >= cmd.permLevel
  // Filtering out test commands
  && (
    cmd.globalCmd === true
      ? true
      : member.guild.id === TEST_SERVER_GUILD_ID
  );

// Mapping our commands
const commandMap = [];
const getCommandMap = () => {
  // Defining our function to populate our commandMap
  // We cant use "commands.map()" because this is located
  // in our top level scope - so it would retrieve the empty collection
  if (commandMap.length === 0) {
    for (const cmd of commands) {
      const { config, data } = cmd[1];
      // Checking for command availability
      if (!config.enabled) continue;

      // Pushing the entry to our map if it's available
      commandMap.push({
        name: data.name,
        permLevel: config.permLevel,
        description: data.description,
        category: data.category,
        globalCmd: config.globalCmd
      });
    }
  }

  // Return the result
  return commandMap;
};

// Export a Select Menu with command data
const getCommandSelectMenu = (member) => {
  // Filtering out unusable commands
  const commandMap = getCommandMap();
  const workingCmdMap = commandMap.filter((cmd) => isAppropriateCommandFilter(member, cmd));

  // Getting our structured array of objects
  let cmdOutput = workingCmdMap.map((cmd) => ({
    label: cmd.name,
    description: cmd.description,
    value: cmd.name
  }));

  // If too long, slice chunk out and notify member
  if (cmdOutput.length > SELECT_MENU_MAX_OPTIONS) {
    const remainder = cmdOutput.length - (SELECT_MENU_MAX_OPTIONS - 1);
    cmdOutput = cmdOutput.slice(0, (SELECT_MENU_MAX_OPTIONS - 1));
    cmdOutput.push({
      label: `And ${remainder} more...`,
      description: 'Use the built-in auto complete functionality when typing the command',
      value: HELP_SELECT_MENU_SEE_MORE_OPTIONS
    });
  }

  // Building our row
  return new ActionRowBuilder()
    .addComponents(
      new SelectMenuBuilder()
        .setCustomId(HELP_COMMAND_SELECT_MENU)
        .setPlaceholder('Select a command')
        .addOptions(cmdOutput)
        .setMinValues(1)
        .setMaxValues(1)
    );
};


// Utility function for building a command info embed
const generateCommandInfoEmbed = (clientCmd, interaction) => {
  // Destructure from our clientCmd object
  const { data, config } = clientCmd;
  const { channel, member } = interaction;

  // Utility function for displaying our permission requirements
  const getPermOutput = (permArr) => {
    return permArr.length >= 1
      ? permArr
        .map((perm) => `${
          channel.permissionsFor(member.user.id).has(PermissionsBitField.Flags[perm])
            ? emojis.success
            : emojis.error
        } ${splitCamelCaseStr(perm, ' ')}
        `)
        .join('\n')
      : `${emojis.success} None required`;
  };

  return {
    color: colorResolver(colors.main),
    title: titleCase(data.name),
    description: `${data.description}`,
    fields: [
      {
        name: 'Category',
        value: titleCase(data.category),
        inline:  true
      },
      {
        name: `${emojis.wait} Cooldown`,
        value: `You can use this command **${
          config.cooldown.usages === 1 ? 'once' :
            config.cooldown.usages === 2 ? 'twice' : `${config.cooldown.usages} times`
        }** every **${config.cooldown.duration}** second${config.cooldown.duration === 1 ? '' : 's'}`,
        inline: false
      },
      {
        name: 'Client Permissions',
        value: getPermOutput(config.clientPerms),
        inline: true
      },
      {
        name: 'User Permissions',
        value: getPermOutput(config.userPerms),
        inline: true
      },
      {
        name: 'SFW',
        value: data.NSFW === true ? `${emojis.error} This command is **not** SFW` : `${emojis.success} This command **is** SFW`,
        inline: false
      }
    ]
  };
};

const generateCommandOverviewEmbed = (commands, interaction) => {
  const { member, guild } = interaction;

  // Generate our embed field data
  const fields = [
    ...sortCommandsByCategory(
      // Filtering out command the user doesn't have access to
      commands.filter((cmd) => cmd.config.permLevel <= member.permLevel)
    )
      .map((entry) => {
        return {
          name: `${entry.category}`,
          value: `**\`${
            entry.commands
              .map((cmd) => cmd.data.name)
              .join('`** - **`')
          }\`**`,
          inline: false
        };
      })
  ];

  return {
    title: `Command help for ${guild.name}`,
    color: colorResolver(colors.main),
    fields,
    footer: {
      text: `Requested by ${member.user.tag}`
    }
  };
};

module.exports = {
  clearSlashCommandData,
  refreshSlashCommandData,
  sortCommandsByCategory,
  throttleCommand,
  checkCommandCanExecute,
  hasAccessToComponentCommand,
  isAppropriateCommandFilter,
  getCommandMap,
  getCommandSelectMenu,
  generateCommandInfoEmbed,
  generateCommandOverviewEmbed
};
