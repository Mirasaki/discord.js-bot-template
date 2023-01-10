const path = require('path');
const { readdirSync, statSync } = require('fs');

/**
 * Get an array of (resolved) absolute file paths in the target directory,
 * Ignores files that start with a "." character
 * @param {string} requestedPath Absolute path to the directory
 * @param {Array<string>} [allowedExtensions=['.js', '.mjs', '.cjs']] Array of file extensions
 * @returns {Array<string>} Array of (resolved) absolute file paths
 */
const getFiles = (
  requestedPath,
  allowedExtensions = [
    '.js',
    '.mjs',
    '.cjs'
  ]
) => {
  if (typeof allowedExtensions === 'string') allowedExtensions = [ allowedExtensions ];
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

module.exports = { getFiles };
