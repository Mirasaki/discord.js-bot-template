const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { TextInputStyle } = require('discord.js');

module.exports = {
  data: {
    description: 'Execute arbitrary JavaScript code'
  },

  config: {
    permLevel: 'Developer'
  },

  run: async ({ interaction }) => {
    // Code Modal
    const codeModal = new ModalBuilder()
      .setCustomId('eval-code-modal')
      .setTitle('JavaScript code');

    // Code Input
    const codeInput = new TextInputBuilder()
      .setCustomId('eval-code-input')
      .setLabel('The JavaScript code to eval')
      .setStyle(TextInputStyle.Paragraph);

    // Modal Rows
    const codeInputRow = new ActionRowBuilder().addComponents(codeInput);

    // Adding the components to our modal
    codeModal.addComponents(codeInputRow);

    // Showing the modal to the user
    await interaction.showModal(codeModal);

    // ModalSubmitInteraction.js handler in /src/listeners/interactions/modalSubmitInteraction.js
  }
};
