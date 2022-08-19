const helpModule = require('./help');

/**
 * @type {import('../../../typings').ComponentCommand}
 */

// Uses the same auto complete querying as the help command
module.exports = {
  run: helpModule.run
};
