const {
  permConfig,
  permLevelMap,
  getInvalidPerms
} = require('../../handlers/permissions');
const path = require('path');
const chalk = require('chalk');

class CommandBase {
  constructor ({ config, data, filePath, run }) {
    // Command config defaults
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
      ...config,

      // Save origin file path in config
      filePath
    };

    this.data = {
      // Default = file name without extension
      name: filePath.slice(
        filePath.lastIndexOf(path.sep) + 1,
        filePath.lastIndexOf('.')
      ),

      // Set category default
      category: filePath.slice(
        filePath.lastIndexOf(path.sep, filePath.lastIndexOf(path.sep) - 1) + 1,
        filePath.lastIndexOf(path.sep)
      ),

      // Overwrite default data with user provided API data
      ...data
    };

    // Set our run function
    this.run = run;

    // Validate our config now that it is overwritten
    this.validateConfig();
    // Transforming our perm level string into an integer
    this.setPermLevel();
  }
  // Transforms the permLevel into an integer
  setPermLevel = () => {
    this.config.permLevel = Number(
      Object.entries(permLevelMap)
        .find(([lvl, name]) => name === this.config.permLevel)[0]
    );
  };

  // Disable our eslint rule
  // The function isn't complex, just long
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
}

module.exports = CommandBase;
