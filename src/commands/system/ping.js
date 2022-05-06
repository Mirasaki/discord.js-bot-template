const statsCommand = require('./stats');

module.exports = {
  ...statsCommand,
  data: {
    ...statsCommand.data,
    name: 'ping'
  }
};
