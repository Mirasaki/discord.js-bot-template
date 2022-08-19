const { Collection } = require('discord.js');

// Local imports
const config = require('../config.js');
const emojis = require('./config/emojis');
const colors = require('./config/colors');

// Building collections
const Commands = new Collection();
const ContextMenus = new Collection();
const Buttons = new Collection();
const Modals = new Collection();
const AutoCompletes = new Collection();
const SelectMenus = new Collection();

/**
 * @type {import('../typings').ClientContainer}
 */

module.exports = {
  // Config
  config,
  emojis,
  colors,

  // Collections
  commands: Commands,
  contextMenus: ContextMenus,
  buttons: Buttons,
  modals: Modals,
  autoCompletes: AutoCompletes,
  selectMenus: SelectMenus
};
