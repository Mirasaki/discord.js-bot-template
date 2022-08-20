const CommandBase = require('./CommandBase');

/**
 * API Command client-side configuration
 * @typedef {Object} APICommandConfig
 * @property {PermLevel} [permLevel='User'] The permission level required to use the command
 * @property {Array<Discord.PermissionResolvable>} [clientPerms=[]] Permissions required by the client to execute the command
 * @property {Array<Discord.PermissionResolvable>} [userPerms=[]] Permissions required by the user to execute the commands
 * @property {boolean} [enabled=true] Is the command currently enabled
 * @property {boolean} [nsfw=false] Is the command Not Safe For Work
 * @property {CommandBaseCooldown} [cooldown] Cooldown configuration for the command
 * @property {string} [filePath='absolute_origin_path'] Path to file, automatically set, can be overwritten, only invoked on command reloads
 * @property {boolean} [globalCmd=false] Is the command enabled globally or only in our test-server
 */

/**
 * API command module
 * @typedef {Object} APICommandModule
 * @property {APICommandConfig} [config] Client-side command configuration
 * @property {Discord.APIApplicationCommand} [data] API Command data
 * @property {CommandCallback} run The command's callback
 */

/**
 * Represents an API command, one of ChatInput (Slash), User Context Menu or Message Context Menu
 * @augments CommandBase
 * @example
 * const myApiCommand = new APICommand({
 *  config: { globalCmd: false } // Load as a server command instead of global
 * });
 */
class APICommand extends CommandBase {
  /**
   * @param {APICommandModule} config The full command configuration
   */
  constructor (cmd) {
    super(cmd);
    /**
     * @property {boolean} [config.globalCmd] Is the command enabled globally or only in our test-server
     */
    this.config.globalCmd = cmd.config.globalCmd || false;
  }
}

module.exports = APICommand;
