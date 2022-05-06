const { readdirSync, statSync } = require('fs');
const moment = require('moment');
const path = require('path');

// getFiles() ignores files that start with "."
module.exports.getFiles = (requestedPath, allowedExtensions) => {
  if (typeof allowedExtensions === 'string') allowedExtensions = [allowedExtensions];
  requestedPath ??= path.resolve(requestedPath);
  let res = [];
  for (let itemInDir of readdirSync(requestedPath)) {
    itemInDir = path.resolve(requestedPath, itemInDir);
    const stat = statSync(itemInDir);
    if (stat.isDirectory()) res = res.concat(this.getFiles(itemInDir, allowedExtensions));
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

// String converter: Mary Had A Little Lamb
module.exports.titleCase = (str) => {
  if (typeof str !== 'string') throw new TypeError('Expected type: String');
  str = str.toLowerCase().split(' ');
  for (let i = 0; i < str.length; i++) str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  return str.join(' ');
};

// Utility function for getting the relative time string using moment
module.exports.getRelativeTime = (date) => moment(date).fromNow();

// Parses a SNAKE_CASE_ARRAY to title-cased strings
module.exports.parseSnakeCaseArray = (arr) => {
  return arr.map((perm) => {
    perm = perm.toLowerCase().split(/[ _]+/);
    for (let i = 0; i < perm.length; i++) perm[i] = perm[i].charAt(0).toUpperCase() + perm[i].slice(1);
    return perm.join(' ');
  }).join('\n');
};

// Mary had a little lamb
module.exports.capitalizeString = (str) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

module.exports.getApproximateObjectSizeBytes = (obj, bytes = 0) => {
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
            for (var key in obj) {
              // eslint-disable-next-line no-prototype-builtins
              if (!obj.hasOwnProperty(key)) continue;
              sizeOf(obj[key]);
            }
          } else bytes += obj.toString().length * 2;
          break;
        }
        default: break;
      }
    }
    return bytes;
  };

  // Return human readable string for displayed the bytes
  const formatByteSize  = (bytes) => {
    if (bytes < 1024) return `${bytes} bytes`;
    else if (bytes < 1048576) return `${(bytes / 1024).toFixed(3)} KiB`;
    else if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(3)} MiB`;
    else return `${(bytes / 1073741824).toFixed(3)} GiB`;
  };

  return formatByteSize(sizeOf(obj));
};
