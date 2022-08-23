/*** @module HTML */

const fs = require('fs');
const { getPermLevelName } = require('./permissions');
const { titleCase } = require('../util');

/*** JSDoc: IGNORED */

/*** Defining our array of properties that should be ignored
 * @member {Array<string>} ignoredCommandProperties Array of ignored properties belonging to our @see {CommandBase} classes
 */
const ignoredCommandProperties = [
  'run',
  'validateConfig',
  'filePath',
  'setPermLevel',
  'setFilePathDetails',
  'load',
  'unload',
  'reload',
  'data',
  'category',
  'enabled'
];

// Defining our styles
const styles = `<style>
html, body {
  padding: 0;
  margin: 0;
  overflow: smooth-scroll;
  width: 100%;
}

.background {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: fixed;
  height: 100%;
  width: 100%;

  z-index: -1;

  background: rgb(50, 56, 62);
  background: -moz-radial-gradient(circle, rgba(50, 56, 62, 1) -25%, rgba(0, 0, 0, 1) 100%);
  background: -webkit-radial-gradient(circle, rgba(50, 56, 62, 1) -25%, rgba(0, 0, 0, 1) 100%);
  background: radial-gradient(circle, rgba(50, 56, 62, 1) -25%, rgba(0, 0, 0, 1) 100%);
}

.commandTableContainer {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
  /* font: 120% system-ui; */
  text-align: center;
  padding-top: 2rem;
  color: blue;
}

table {
  margin: 0 auto;
}

table td,
table th {
  padding: 8px;
}

thead {
  color: #fff;
  background-color: rgb(4, 170, 109);
  font-weight: 600;
  text-shadow: 2px 2px rgb(74, 74, 74);
}

tbody > tr {
  color: white;
}

tbody tr:nth-child(even) {
  background-color: rgba(0,0,0,.3);
}

tbody > tr:hover {
  background-color: rgba(4, 170, 109, .3);
  text-decoration: none;
}
</style>`;

// How the property name should be displayed to the user
const formatPropertyKey = (key) => {
  switch (key) {
    case 'permLevel': return 'Permission Level';
    case 'clientPerms': return 'Bot</br>Permissions';
    case 'userPerms': return 'User</br>Permissions';
    case 'nsfw': return 'NSFW';
    default: return titleCase(key);
  }
};

// How the properties value should be displayed to the user
const getValueOutput = (key, value) => {
  switch (key) {
    // Booleans
    case 'nsfw':
    case 'global': return value === true ? '✅' : '🚫';

    // Cooldown
    case 'cooldown': return `
      <strong>Uses:</strong> ${value.usages}
      <br/><strong>Duration:</strong> ${value.duration} seconds
      </br><strong>Type:</strong> ${value.type}
    `;

    // PermLevel
    case 'permLevel': return getPermLevelName(value);

    // Permission Arrays
    case 'userPerms':
    case 'clientPerms': {
      return value.join('</br>');
    }
    default: return value;
  }
};

const baseHTMLStart = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commands</title>

  ${styles}
</head>
<body>
  <div class="background"></div>
  <div class="commandTableContainer">
    <table>
      <thead>
        <tr>
`;

const baseHTMLEnd = `
      </tbody>
    </table>
  </div>
</body>
</html>
`;

const generateCommandHTML = (commands) => {
  // Initial html
  let html = baseHTMLStart;

  // Adding command name as the first table head column
  html += '<th>Name</th>'; // Name
  html += '<th>Description</th>'; // Description

  // Building our table head
  for (const key in commands.first()) {
    // Continue if we don't want to display this property
    if (ignoredCommandProperties.includes(key)) continue;
    html += '<th>' + formatPropertyKey(key) + '</th>';
  }

  // Closing the first row and opening the table body tag
  html += '</tr></thead><tbody>';

  // Looping over our command collection
  let currCat = undefined;
  commands.forEach((cmd) => {
    // Skip if the command is not enabled
    if (!cmd.enabled) return;

    // Adding an empty line after category change,
    // Ignore first category so we don't start with an empty line
    if (cmd.category !== currCat && cmd.category !== commands.first().category) {
      html += `<tr style="visibility: hidden; height: 40px;">
        ${'<td></td>'.repeat(9)}
      </tr>`;
    }
    currCat = cmd.category;

    // Adding a table row containing the command property values
    html += '<tr>';

    // Adding the name first
    html += `<td>${cmd.data.name}</td>`; // Name
    html += `<td>${cmd.data.description}</td>`; // Description
    // Looping over additional properties
    for (const [key, value] of Object.entries(cmd)) {
      // Continue if we don't want to display this property
      if (ignoredCommandProperties.includes(key)) continue;
      html += `<td>${getValueOutput(key, value)}</td>`;
    }

    html += '</tr>';
  });

  // Closing our open tags
  html += baseHTMLEnd;

  // Saving the file
  fs.writeFileSync('public/commands.html', html);
};

module.exports = {
  generateCommandHTML
};
