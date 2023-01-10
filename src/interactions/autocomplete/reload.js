const { ComponentCommand } = require('../../classes/Commands');
const helpModule = require('./help');

// Uses the same auto complete querying as the help command
module.exports = new ComponentCommand({ run: helpModule.run });
