const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const logger = require('@mirasaki/logger');
const { stripIndents } = require('common-tags/lib');
const { ComponentType } = require('discord.js');
const { colorResolver } = require('../../util');

// Mapping our custom ids
const EVAL_CODE_MODAL = 'eval-code-modal';
const EVAL_CODE_INPUT = 'eval-code-input';
const ACCEPT_EVAL_CODE_EXECUTION = 'accept_eval_code';
const DECLINE_EVAL_CODE_EXECUTION = 'decline_eval_code';

// Destructure from env
const {
  DEBUG_MODAL_SUBMIT_RESPONSE_TIME
} = process.env;

// eslint-disable-next-line sonarjs/cognitive-complexity
module.exports = async (client, interaction) => {
  // guild property is present and available,
  // we check in the main interactionCreate.js file

  // Destructure from interaction
  const {
    customId,
    member
  } = interaction;
  const { emojis, colors } = client.container;

  // Start our timer for performance logging
  const modalSubmitStart = process.hrtime();

  // Switch case, future proof
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (customId) {
    case EVAL_CODE_MODAL: {
      // Defer our reply
      await interaction.deferReply();

      // Code Input
      const codeInput = interaction.fields.getTextInputValue(EVAL_CODE_INPUT);

      // Verification prompt
      await interaction.editReply({
        content: `${emojis.wait} ${member}, are you sure you want to execute the following code:`,
        embeds: [
          {
            color: colorResolver(),
            description: stripIndents`
              \`\`\`js
              ${codeInput}
              \`\`\`
            `
          }
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(ACCEPT_EVAL_CODE_EXECUTION)
              .setLabel('Accept')
              .setStyle('Success'),
            new ButtonBuilder()
              .setCustomId(DECLINE_EVAL_CODE_EXECUTION)
              .setLabel('Decline')
              .setStyle('Danger')
          )
        ]
      });

      // Interaction Message
      const interactionMessage = await interaction.fetchReply();

      // Button reply/input collector
      const acceptEvalCollector = interactionMessage.createMessageComponentCollector({
        filter: (i) => (
          i.customId === ACCEPT_EVAL_CODE_EXECUTION || i.customId === DECLINE_EVAL_CODE_EXECUTION
        ) && i.user.id === interaction.user.id,
        componentType: ComponentType.Button,
        time: 60000
      });

      acceptEvalCollector.on('collect', async (i) => {
        // Execute the code
        if (i.customId === ACCEPT_EVAL_CODE_EXECUTION) {
          // Editing original command interaction
          await interaction.editReply({
            content: `${emojis.success} ${member}, this code is now executing...`,
            embeds: [
              {
                color: colorResolver(colors.error),
                description: stripIndents`
                  \`\`\`js
                    ${parseCodeblock(codeInput)}
                  \`\`\`
                `
              }
            ],
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId(ACCEPT_EVAL_CODE_EXECUTION)
                  .setDisabled(true)
                  .setLabel('Executing...')
                  .setStyle('Success')
              )
            ]
          });

          // Defer our reply
          await i.deferReply();

          // Performance measuring
          let evaled;
          const startEvalTime = process.hrtime();

          try {
            // eslint-disable-next-line no-eval
            evaled = eval(codeInput);
            if (evaled instanceof Promise) evaled = await evaled;

            // Get execution time
            const timeSinceHrMs = (
              process.hrtime(startEvalTime)[0] * 1000
              + startEvalTime[1] / 1000000
            ).toFixed(2);
            const timeSinceStr = `${(timeSinceHrMs / 1000).toFixed(2)} seconds (${timeSinceHrMs} ms)`;

            // String response
            const response = [
              `\`\`\`js\n${clean(require('util').inspect(evaled, { depth: 0 }))}\`\`\``,
              `\`\`\`fix\n${timeSinceStr}\`\`\``
            ];

            // Building the embed
            const evalEmbed = {
              color: colorResolver(),
              description: `:inbox_tray: **Input:**\n\`\`\`js\n${codeInput}\n\`\`\``,
              fields: [
                {
                  name: ':outbox_tray: Output:',
                  value: `${response[0]}`,
                  inline: false
                },
                {
                  name: 'Time taken',
                  value: `${response[1]}`,
                  inline: false
                }
              ]
            };

            // Result fits within character limit
            if (response[0].length <= 1024) {
              await interaction.editReply({
                content: `${emojis.success} ${member}, this code has been executed.`,
                embeds: [ evalEmbed ],
                components: [
                  new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setCustomId(ACCEPT_EVAL_CODE_EXECUTION)
                      .setDisabled(true)
                      .setLabel('Executed')
                      .setStyle('Success')
                  )
                ]
              });
            }

            // Output is too many characters
            else {
              const output = Buffer.from(response.join('\n').replace(/`/g, ''));
              await interaction.editReply({
                content: `${emojis.success} ${member}, this code has been executed.`,
                components: [
                  new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setCustomId(ACCEPT_EVAL_CODE_EXECUTION)
                      .setDisabled(true)
                      .setLabel('Executed')
                      .setStyle('Success')
                  )
                ],
                files: [{
                  attachment: output,
                  name: 'evalOutput.txt'
                }]
              });
            }

            // Reply to button interaction
            i.editReply({
              content: `${emojis.success} ${member}, finished code execution.`
            });

          // Log potential errors
          } catch (err) {
            logger.syserr('Encountered error while executing /eval code');
            logger.printErr(err);
            // Update button interaction
            i.editReply({
              content: `${emojis.error} ${member}, code execution error, check original embed for output.`
            });
            // Update original embed interaction
            const timeSinceHrMs = (
              process.hrtime(startEvalTime)[0] * 1000
              + startEvalTime[1] / 1000000
            ).toFixed(2);
            const timeSinceStr = `${(timeSinceHrMs / 1000).toFixed(2)} seconds (${timeSinceHrMs} ms)`;
            interaction.editReply({
              embeds: [
                {
                  color: colorResolver(),
                  description: `:inbox_tray: **Input:**\n\`\`\`js\n${codeInput}\n\`\`\``,
                  fields: [
                    {
                      name: ':outbox_tray: Output:',
                      value: `\`\`\`js\n${err.stack || err}\n\`\`\``,
                      inline: false
                    },
                    {
                      name: 'Time taken',
                      value: `\`\`\`fix\n${timeSinceStr}\n\`\`\``,
                      inline: false
                    }
                  ]
                }
              ]
            });
          }


        }

        // Don't execute the code
        else {
          // Reply to button interaction
          await i.reply({
            content: `${emojis.error} ${member}, cancelling code execution.`
          });
          // Reply and close initial command interaction
          await interaction.editReply({
            content: `${emojis.error} ${member}, this code block has been discarded.`,
            components: []
          });
        }
      });

      break;
    }

    // Debug unknown customIds
    default: {
      logger.debug(`Unknown ModalSubmitInteraction received. Id: ${customId}.`);
      break;
    }

  }

  // Performance logging if requested depending on environment
  if (DEBUG_MODAL_SUBMIT_RESPONSE_TIME === 'true') {
    logger.debug(`Received and handled "${customId}" modal-submit in ${logger.getExecutionTime(modalSubmitStart)}`);
  }

};

const clean = (text) => {
  if (typeof (text) === 'string') {
    return text.replace(/`/g, '`'
      + String.fromCharCode(8203)).replace(/@/g, '@'
      + String.fromCharCode(8203))
      .replace(new RegExp(process.env.DISCORD_BOT_TOKEN), '<token>');
  } else return text;
};

// Code from: https://github.com/lifeguardbot/lifeguard/blob/a31f57b5164d95d16f0dd961c10a5b77dc9e7bd4/src/plugins/dev/eval.ts#L6-L13
function parseCodeblock (script) {
  const cbr = /^(([ \t]*`{3,4})([^\n]*)([\s\S]+?)(^[ \t]*\2))/gm;
  const result = cbr.exec(script);
  if (result) return result[4];
  return script;
}
