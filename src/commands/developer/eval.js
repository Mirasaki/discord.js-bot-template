const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { TextInputStyle } = require('discord.js');
// Unique identifiers for our components' customIds
const { EVAL_CODE_MODAL, EVAL_CODE_INPUT } = require('../../constants');

/**
 * @type {import('../../../typings').ChatInputCommand}
 */

module.exports = {
  data: {
    description: 'Evaluate arbitrary JavaScript code'
  },

  config: {
    permLevel: 'Developer',
    clientPerms: ['EmbedLinks','AttachFiles']
  },

  run: async ({ interaction }) => {
    // Code Modal
    const codeModal = new ModalBuilder()
      .setCustomId(EVAL_CODE_MODAL)
      .setTitle('JavaScript code');

    // Code Input
    const codeInput = new TextInputBuilder()
      .setCustomId(EVAL_CODE_INPUT)
      .setLabel('The JavaScript code to evaluate')
      .setStyle(TextInputStyle.Paragraph);

    // Modal Rows
    const codeInputRow = new ActionRowBuilder().addComponents(codeInput);

    // Adding the components to our modal
    codeModal.addComponents(codeInputRow);

    // Showing the modal to the user
    await interaction.showModal(codeModal);
  }
};
