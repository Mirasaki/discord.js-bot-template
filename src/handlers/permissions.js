/**
 * Our permission handler, holds utility functions and everything to do with
 * handling permissions in this template. Exported from `/src/handlers/permissions.js`.
 * See {@tutorial permissions} for an overview.
 * @module PermissionHandler
 */

const { PermissionsBitField } = require('discord.js');
const config = require('../../config');

/**
 * Check if the command invoker has this level
 * @typedef {Function} hasLevel
 * @param {Discord.GuildMember} member The Discord API member object
 * @param {Discord.GuildChannel} [channel] The Discord API channel object
 * @returns {boolean} Indicates if the invoke has this permission level
 */

/**
 * Represents a valid permission configuration data entry
 * @typedef {Object} PermConfigEntry
 * @property {string} name The name of the permission level
 * @property {number} level The level of the permission level
 * @property {module:PermissionHandler~hasLevel} hasLevel Indicates if the invoker has this permission level
 */

/**
 * Our ordered permission level configuration
 * @member {Array<module:PermissionHandler~PermConfigEntry>} permConfig
 */
const permConfig = [
  {
    name: 'User',
    level: 0,
    hasLevel: () => true
  },

  {
    name: 'Moderator',
    level: 1,
    hasLevel: (member, channel) => hasChannelPerms(
      member.id, channel, ['KickMembers', 'BanMembers']
    ) === true
  },

  {
    name: 'Administrator',
    level: 2,
    hasLevel: (member, channel) => hasChannelPerms(member.id, channel, ['Administrator']) === true
  },

  {
    name: 'Server Owner',
    level: 3,
    hasLevel: (member, channel) => {
      // Shorthand
      // hasLevel: (member, channel) => (channel.guild?.ownerId === member.user?.id)
      // COULD result in (undefined === undefined)
      if (channel.guild && channel.guild.ownerId) {
        return (channel.guild.ownerId === member.id);
      }
      return false;
    }
  },

  {
    name: 'Developer',
    level: 4,
    hasLevel: (member) => config.permissions.developers.includes(member.id)
  },

  {
    name: 'Bot Owner',
    level: 5,
    hasLevel: (member) => config.permissions.ownerId === member.id
  }
];

/**
 * Enum for our permission levels/names
 * @readonly
 * @enum {string}
 */
const permLevelMap = { ...permConfig.map(({ name }) => name) };

/**
 * Our {@link PermissionHandler~PermConfig} sorted by perm level, highest first
 * @member {Array<module:PermissionHandler~PermConfigEntry>} sortedPermConfig
 */
const sortedPermConfig = permConfig.sort((a, b) => {
  return b.level - a.level;
});

/**
 * Resolves someone's permission level
 * @method getPermissionLevel
 * @param {Discord.GuildMember} member The Discord API member object
 * @param {Discord.GuildChannel} channel The Discord API channel object
 * @returns {number} The member's permission level
 */
const getPermissionLevel = (member, channel) => {
  for (const currLvl of sortedPermConfig) {
    if (currLvl.hasLevel(member, channel)) {
      return currLvl.level;
    }
  }
};

/**
 * Check if an array of permission strings has any invalid API permissions
 * @param {Array<string>} permArr Array of permission in string form
 * @returns {Array<Discord.PermissionFlagsBits>} Array of invalid permissions
 */
const getInvalidPerms = (permArr) =>
  permArr.filter((perm) => typeof PermissionsBitField.Flags[perm] === 'undefined');

/**
 * Check if a user has specific permissions in a channel
 * @param {string} userId The ID of the user
 * @param {Discord.GuildCHannel} channel The channel to check permissions in
 * @param {Array<string>} permArr The array of permissions to check for
 * @returns {true | Array<Discord.PermissionFlagsBits>} True if the member has all permissions,
 * or the array of missing permissions
 */
const hasChannelPerms = (userId, channel, permArr) => {
  // Convert string to array
  if (typeof permArr === 'string') permArr = [permArr];

  // Making sure all our perms are valid
  const invalidPerms = getInvalidPerms(permArr);
  if (invalidPerms.length >= 1) {
    throw new Error(`Invalid Discord permissions were provided: ${invalidPerms.join(', ')}`);
  }

  // Return the entire array if no permissions are found
  if (!channel.permissionsFor(userId)) return permArr;

  // Filter missing permissions
  const missingPerms = permArr.filter((perm) => !channel.permissionsFor(userId).has(PermissionsBitField.Flags[perm]));
  return missingPerms.length >= 1 ? missingPerms : true;
};

module.exports = {
  permConfig,
  sortedPermConfig,
  permLevelMap,
  getPermissionLevel,
  getInvalidPerms,
  hasChannelPerms
};
