const { OAuth2Scopes, PermissionFlagsBits } = require('discord.js');
const { readdirSync, statSync } = require('fs');
const moment = require('moment');
const path = require('path');
const colors = require('./config/colors.json');

// Import our constants
const {
  NS_IN_ONE_MS,
  NS_IN_ONE_SECOND,
  BYTES_IN_KIB,
  BYTES_IN_MIB,
  BYTES_IN_GIB
} = require('./constants');

// Return integer color code
const colorResolver = (input) => {
  // Return main bot color if no input is provided
  if (!input) return parseInt(colors.main.slice(1), 16);

  // Hex values
  if (typeof input === 'string') {
    input = parseInt(input.slice(1), 16);
  }

  else if (Array.isArray(input)) {
    // HSL values
    if (input[0] === 'hsl') {
      const h = input[1];
      const s = input[2];
      let l = input[3];
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
      };
      return parseInt(`${f(0)}${f(8)}${f(4)}`, 16);
    }

    // RGB values
    else {
      input = (input[0] << 16) + (input[1] << 8) + input[2];
    }
  }

  return input;
};

// getFiles() ignores files that start with "."
const getFiles = (requestedPath, allowedExtensions) => {
  if (typeof allowedExtensions === 'string') allowedExtensions = [allowedExtensions];
  requestedPath ??= path.resolve(requestedPath);
  let res = [];
  for (let itemInDir of readdirSync(requestedPath)) {
    itemInDir = path.resolve(requestedPath, itemInDir);
    const stat = statSync(itemInDir);
    if (stat.isDirectory()) res = res.concat(getFiles(itemInDir, allowedExtensions));
    if (
      stat.isFile()
      && allowedExtensions.find((ext) => itemInDir.endsWith(ext))
      && !itemInDir.slice(
        itemInDir.lastIndexOf(path.sep) + 1, itemInDir.length
      ).startsWith('.')
    ) res.push(itemInDir);
  }
  return res;
};

// Utility function for getting the relative time string using moment
const getRelativeTime = (date) => moment(date).fromNow();

// String converter: Mary Had A Little Lamb
const titleCase = (str) => {
  if (typeof str !== 'string') throw new TypeError('Expected type: String');
  str = str.toLowerCase().split(' ');
  for (let i = 0; i < str.length; i++) str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  return str.join(' ');
};

// Parses a SNAKE_CASE_ARRAY to title-cased strings
const parseSnakeCaseArray = (arr) => {
  return arr.map((perm) => {
    perm = perm.toLowerCase().split(/[ _]+/);
    for (let i = 0; i < perm.length; i++) perm[i] = perm[i].charAt(0).toUpperCase() + perm[i].slice(1);
    return perm.join(' ');
  }).join('\n');
};

// Split a camel case array at uppercase
const splitCamelCaseStr = (str, joinCharacter) => {
  const arr = str.split(/ |\B(?=[A-Z])/);
  if (typeof joinCharacter === 'string') {
    return arr.join(joinCharacter);
  }
  return arr;
};

// String converter: Mary had a little lamb
const capitalizeString = (str) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

const getApproximateObjectSizeBytes = (obj, bytes = 0) => {
  // Separate function to avoid code complexity
  const loopObj = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'undefined') continue;
      sizeOf(obj[key]);
    }
  };

  // Determine the size of the object
  const sizeOf = (obj) => {
    if (obj !== null && obj !== undefined) {
      switch (typeof obj) {
        case 'number': bytes += 8; break;
        case 'string': bytes += obj.length * 2; break;
        case 'boolean': bytes += 4; break;
        case 'object': {
          const objClass = Object.prototype.toString.call(obj).slice(8, -1);
          if (objClass === 'Object' || objClass === 'Array') {
            loopObj(obj);
          } else bytes += obj.toString().length * 2;
          break;
        }
        default: break;
      }
    }
    return bytes;
  };

  // Return human readable string for displaying the bytes
  const formatByteSize  = (bytes) => {
    if (bytes < BYTES_IN_KIB) return `${bytes} bytes`;
    else if (bytes < BYTES_IN_MIB) return `${(bytes / BYTES_IN_KIB).toFixed(3)} KiB`;
    else if (bytes < BYTES_IN_GIB) return `${(bytes / BYTES_IN_MIB).toFixed(3)} MiB`;
    else return `${(bytes / BYTES_IN_GIB).toFixed(3)} GiB`;
  };

  return formatByteSize(sizeOf(obj));
};

// Get bot invite link, takes permissions into consideration
const getBotInviteLink = (client) => {
  const { commands } = client.container;
  const uniqueCombinedPermissions = [ ...new Set([].concat(...commands.map((cmd => cmd.config.clientPerms)))) ];
  return client.generateInvite({
    scopes: [ OAuth2Scopes.ApplicationsCommands, OAuth2Scopes.Bot ],
    permissions: uniqueCombinedPermissions.map((rawPerm) => PermissionFlagsBits[rawPerm])
  });
};

// Utility wait function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Get runtime since process.hrtime.bigint() - NOT process.hrtime()
const DEFAULT_DECIMAL_PRECISION = 2;
const getRuntime = (hrtime, decimalPrecision = DEFAULT_DECIMAL_PRECISION) => {
  // Converting
  const inNS = process.hrtime.bigint() - hrtime;
  const nsNumber = Number(inNS);
  const inMS = (nsNumber / NS_IN_ONE_MS).toFixed(decimalPrecision);
  const InSeconds = (nsNumber / NS_IN_ONE_SECOND).toFixed(decimalPrecision);

  // Return the conversions
  return {
    seconds: InSeconds,
    ms: inMS,
    ns: inNS
  };
};

module.exports = {
  splitCamelCaseStr,
  colorResolver,
  getFiles,
  getRelativeTime,
  parseSnakeCaseArray,
  titleCase,
  capitalizeString,
  getApproximateObjectSizeBytes,
  getBotInviteLink,
  wait: sleep,
  sleep,
  getRuntime
};
