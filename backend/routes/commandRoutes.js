const { Collection } = require('discord.js');
const express = require('express');
const { getFiles } = require('../util/files');
const router = express.Router();

// Re-usable callback
const commandMapCallback = (filePath) => {
  const cmd = require(filePath);
  cmd.load(filePath, new Collection());
  delete cmd.filePath; // Delete our origin filePath
  return cmd;
};

// Utility function to avoid code repetition
const queryFilterCommands = (arr, category, limit) => {
  return arr
    .filter((cmd) => cmd.category?.toLowerCase() === category.toLowerCase())
    .slice(0, limit >= 1  ? limit : arr.length);
};

// Client Chat Input Commands
const clientCommands = getFiles('src/commands')
  .map(commandMapCallback);
// Client Context Menus
const clientCtxMenus = getFiles('src/context-menus')
  .map(commandMapCallback);
// Client Auto Complete Components
const clientAutoCompletes = getFiles('src/interactions/autocomplete')
  .map(commandMapCallback);
// Client Button Components
const clientButtons = getFiles('src/interactions/buttons')
  .map(commandMapCallback);
// Client Modal Components
const clientModals = getFiles('src/interactions/modals')
  .map(commandMapCallback);
// Client Select Menu Components
const clientSelectMenus = getFiles('src/interactions/select-menus')
  .map(commandMapCallback);

// Application Chat Input Commands
router.route('/')
  .get((req, res) => {
    // Access the provided query parameters
    const category = req.query.category;
    const limit = req.query.limit || -1;

    // Filter by category if requested
    const usesCategoryFilter = category !== undefined;
    if (usesCategoryFilter) {
      const result = queryFilterCommands(clientCommands, category, limit);
      res.send(result);
      return;
    }

    // Return our command map if the map is populated
    res.send(
      clientCommands
        // Limiting our result
        .slice(0, limit >= 1 ? limit : clientCommands.length)
    );
  });

// Application Context Menu Commands
router.route('/context-menus')
  .get((req, res) => {
    // Access the provided query parameters
    const category = req.query.category;
    const limit = req.query.limit || -1;

    // Filter by category if requested
    const usesCategoryFilter = category !== undefined;
    if (usesCategoryFilter) {
      const result = queryFilterCommands(clientCtxMenus, category, limit);
      res.send(result);
      return;
    }

    // Return our command map if the map is populated
    res.send(
      clientCtxMenus
        // Limiting our result
        .slice(0, limit >= 1 ? limit : clientCtxMenus.length)
    );
  });

// Application Auto Complete Commands
router.route('/auto-complete')
  .get((req, res) => {
    // Access the provided query parameters
    const category = req.query.category;
    const limit = req.query.limit || -1;

    // Filter by category if requested
    const usesCategoryFilter = category !== undefined;
    if (usesCategoryFilter) {
      const result = queryFilterCommands(clientAutoCompletes, category, limit);
      res.send(result);
      return;
    }

    // Return our command map if the map is populated
    res.send(
      clientAutoCompletes
        // Limiting our result
        .slice(0, limit >= 1 ? limit : clientAutoCompletes.length)
    );
  });

// Application Button Commands
router.route('/buttons')
  .get((req, res) => {
    // Access the provided query parameters
    const category = req.query.category;
    const limit = req.query.limit || -1;

    // Filter by category if requested
    const usesCategoryFilter = category !== undefined;
    if (usesCategoryFilter) {
      const result = queryFilterCommands(clientButtons, category, limit);
      res.send(result);
      return;
    }

    // Return our command map if the map is populated
    res.send(
      clientButtons
        // Limiting our result
        .slice(0, limit >= 1 ? limit : clientButtons.length)
    );
  });

// Application Modal Commands
router.route('/modals')
  .get((req, res) => {
    // Access the provided query parameters
    const category = req.query.category;
    const limit = req.query.limit || -1;

    // Filter by category if requested
    const usesCategoryFilter = category !== undefined;
    if (usesCategoryFilter) {
      const result = queryFilterCommands(clientModals, category, limit);
      res.send(result);
      return;
    }

    // Return our command map if the map is populated
    res.send(
      clientModals
        // Limiting our result
        .slice(0, limit >= 1 ? limit : clientModals.length)
    );
  });

// Application Select Menu Commands
router.route('/select-menus')
  .get((req, res) => {
    // Access the provided query parameters
    const category = req.query.category;
    const limit = req.query.limit || -1;

    // Filter by category if requested
    const usesCategoryFilter = category !== undefined;
    if (usesCategoryFilter) {
      const result = queryFilterCommands(clientSelectMenus, category, limit);
      res.send(result);
      return;
    }

    // Return our command map if the map is populated
    res.send(
      clientSelectMenus
        // Limiting our result
        .slice(0, limit >= 1 ? limit : clientSelectMenus.length)
    );
  });

/**
 * Filter by name, catch all, end of file
 */

// Application Chat Input Commands - Find by name
router.route('/:name')
  .get((req, res) => {
    // Destructure name from out route parameters
    const { name } = req.params;
    // Finding our related command
    const cmd = clientCommands.find((cmd) => cmd.data.name === name);
    if (cmd) res.send(cmd);
    else res.sendStatus(404);
  });

// Application Context Menu Commands - Find by name
router.route('/context-menus/:name')
  .get((req, res) => {
    // Destructure name from out route parameters
    const { name } = req.params;
    // Finding our related command
    const cmd = clientCtxMenus.find((cmd) => cmd.data.name === name);
    if (cmd) res.send(cmd);
    else res.sendStatus(404);
  });

// Application Auto Complete Commands - Find by name
router.route('/auto-complete/:name')
  .get((req, res) => {
    // Destructure name from out route parameters
    const { name } = req.params;
    // Finding our related command
    const cmd = clientAutoCompletes.find((cmd) => cmd.data.name === name);
    if (cmd) res.send(cmd);
    else res.sendStatus(404);
  });

// Application Button Commands - Find by name
router.route('/buttons/:name')
  .get((req, res) => {
    // Destructure name from out route parameters
    const { name } = req.params;
    // Finding our related command
    const cmd = clientButtons.find((cmd) => cmd.data.name === name);
    if (cmd) res.send(cmd);
    else res.sendStatus(404);
  });

// Application Modal Commands - Find by name
router.route('/modals/:name')
  .get((req, res) => {
    // Destructure name from out route parameters
    const { name } = req.params;
    // Finding our related command
    const cmd = clientModals.find((cmd) => cmd.data.name === name);
    if (cmd) res.send(cmd);
    else res.sendStatus(404);
  });

// Application Select Menu Commands - Find by name
router.route('/select-menus/:name')
  .get((req, res) => {
    // Destructure name from out route parameters
    const { name } = req.params;
    // Finding our related command
    const cmd = clientSelectMenus.find((cmd) => cmd.data.name === name);
    if (cmd) res.send(cmd);
    else res.sendStatus(404);
  });


module.exports = router;
