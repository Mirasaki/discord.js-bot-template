const {
  permConfig,
  permLevelMap,
  getInvalidPerms
} = require('../../handlers/permissions');
const path = require('path');
const chalk = require('chalk');

/**
 * @typedef {import('discord.js')} Discord
 */

/**
 * Valid permission levels
 * @typedef {'User' | 'Moderator' | 'Administrator' | 'Server Owner' | 'Developer' | 'Bot Owner'} PermLevel
 */

/**
 * Available cooldown types
 * @typedef {'user' | 'member' | 'guild' | 'channel' | 'global'} CooldownTypes
 */

/**
 * Command cooldown/throttling configuration
 * @typedef {Object} CommandBaseCooldown
 * @property {CooldownTypes} [type] The type of command throttling applied to this command
 * @property {number} [usages] The amount of times the command can be used within the specified duration
 * @property {number} [duration] The duration (in seconds) usages should be tracked for
 */

/**
 * Base command configuration
 * @typedef {Object} CommandBaseConfig
 * @property {PermLevel} [permLevel='User'] The permission level required to use the command
 * @property {Array<Discord.PermissionResolvable>} [clientPerms=[]] Permissions required by the client to execute the command
 * @property {Array<Discord.PermissionResolvable>} [userPerms=[]] Permissions required by the user to execute the commands
 * @property {boolean} [enabled=true] Is the command currently enabled
 * @property {boolean} [nsfw=false] Is the command Not Safe For Work
 * @property {CommandBaseCooldown} [cooldown] Cooldown configuration for the command
 * @property {string} [filePath='absolute_origin_path'] Path to file, automatically set, can be overwritten, only invoked on command reloads
 */

/**
 * The arguments received on callback
 * @typedef {Object} CommandBaseRunArguments
 * @property {Discord.ChatInputCommandInteraction} interaction The interaction received
 * @property {Client} client Our discord.js-extended client
 */

/**
   * The user-provided callback executed when the command is ran
   * @typedef {Function} CommandCallback
   * @param {CommandBaseRunArguments} args The arguments received on callback
   * @returns {void | Promise<void>}
   */

/**
 * Base command module
 * @typedef {Object} CommandModule
 * @property {CommandBaseConfig} [config] Client-side command configuration
 * @property {Discord.APIApplicationCommand} [data] API Command data
 * @property {CommandCallback} run The command's callback
 */

/** Represents the base class used for all our commands & components */
class CommandBase {
  /**
   * @param {CommandModule} config The full command configuration
   */
  constructor (command) {
    /**
     * @property {CommandBaseConfig} config The client-side command configuration
     */
    this.config = {
      // Permissions
      permLevel: permConfig[permConfig.length - 1].name,
      clientPerms: [],
      userPerms: [],

      // Status
      enabled: true,
      nsfw: false,

      // Command Cooldown
      cooldown: {
        type: 'member',
        usages: 1,
        duration: 2
      },

      // Overwrite base-config with user provided config
      ...command.config,

      // Save origin file path in config
      filePath: command.filePath
    };

    /**
     * @property {Discord.APIApplicationCommand} data Discord API command data
     */
    this.data = {
      // Default = file name without extension
      name: command.filePath.slice(
        command.filePath.lastIndexOf(path.sep) + 1,
        command.filePath.lastIndexOf('.')
      ),

      // Set category default
      category: command.filePath.slice(
        command.filePath.lastIndexOf(path.sep, command.filePath.lastIndexOf(path.sep) - 1) + 1,
        command.filePath.lastIndexOf(path.sep)
      ),

      // Overwrite default data with user provided API data
      ...command.data
    };

    this.run = command.run;

    // Validate our config now that it is overwritten
    this.validateConfig();
    // Transforming our perm level string into an integer
    this.setPermLevel();
  }

  /**
   * Transforms the permLevel into an integer
   * @method
   * @returns {void}
   */
  setPermLevel = () => {
    this.config.permLevel = Number(
      Object.entries(permLevelMap)
        .find(([lvl, name]) => name === this.config.permLevel)[0]
    );
  };

  /**
   * Validate our command config and API data
   * @method
   * @throws {Error}
   * @returns {void}
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  validateConfig = () => {
    // Destructure
    const { config, data, run } = this;

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

    // Check boolean nsfw
    if (typeof this.config.nsfw !== 'boolean') throw new Error(`Expected boolean at config.nsfw\nCommand: ${data.name}`);

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
  };

  /**
   * The callback executed when the command is ran
   * @method
   * @param {CommandBaseRunArguments} args The arguments received on callback
   * @returns {void | Promise<void>}
   */
  run = () => {};
}

module.exports = CommandBase;
