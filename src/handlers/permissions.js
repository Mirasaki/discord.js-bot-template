const { PermissionsBitField } = require('discord.js');
const config = require('../../config/config.json');

// Our ordered permission level configuration
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
        return (channel.guild.ownerId === member.user?.id);
      }
      return false;
    }
  },

  {
    name: 'Developer',
    level: 4,
    hasLevel: (member) => config.permissions.developers.includes(member.user.id)
  },

  {
    name: 'Bot Owner',
    level: 5,
    hasLevel: (member) => config.permissions.ownerId === member.user.id
  }
].reverse();

// Creating a permission level map/list
const permLevelMap = { ...permConfig.map(({ name }) => name) };

// Get someone's permLvl, returns Integer
const getPermissionLevel = (member, channel) => {
  for (const currLvl of permConfig) {
    if (currLvl.hasLevel(member, channel)) {
      return currLvl.level;
    }
  }
};

// Utility function for checking if provided permissions are actually valid
const getInvalidPerms = (permArr) =>
  permArr.filter((perm) => typeof PermissionsBitField.Flags[perm] === 'undefined');

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
  permLevelMap,
  getPermissionLevel,
  getInvalidPerms,
  hasChannelPerms
};
