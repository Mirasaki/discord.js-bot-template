const statsCommand = require('./stats');

/**
 * @type {import('../../../typings').ChatInputCommand}
 */

// Spread all the data from our /stats command but overwrite the name
module.exports = {
  ...statsCommand,
  data: {
    ...statsCommand.data,
    name: 'ping'
  }
};
