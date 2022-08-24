// @ts-check

const EMBED_MAX_FIELDS_LENGTH = 25;
const EMBED_MAX_CHARACTER_LENGTH = 6000;
const EMBED_TITLE_MAX_LENGTH = 256;
const EMBED_DESCRIPTION_MAX_LENGTH = 4096;
const EMBED_FIELD_NAME_MAX_LENGTH = 256;
const EMBED_FIELD_VALUE_MAX_LENGTH = 1024;
const EMBED_FOOTER_TEXT_MAX_LENGTH = 2048;
const EMBED_AUTHOR_NAME_MAX_LENGTH = 256;

const MESSAGE_CONTENT_MAX_LENGTH = 2000;
const SELECT_MENU_MAX_OPTIONS = 25;
const AUTOCOMPLETE_MAX_DATA_OPTIONS = 25;

const BYTES_IN_KIB = 1024;
const BYTES_IN_MIB = 1048576;
const BYTES_IN_GIB = 1073741824;

const NS_IN_ONE_MS = 1000000;
const NS_IN_ONE_SECOND = 1000000000;

const MS_IN_ONE_SECOND = 1000;
const MS_IN_ONE_MINUTE = 60000;
const MS_IN_ONE_HOUR = 3600000;
const MS_IN_ONE_DAY = 86400000;

const SECONDS_IN_ONE_MINUTE = 60;
const MINUTES_IN_ONE_HOUR = 60;
const HOURS_IN_ONE_DAY = 24;

const DEFAULT_DECIMAL_PRECISION = 2;

/***
 * Commands & Components
 */

// Help
const HELP_COMMAND_SELECT_MENU = 'help_select_command';
const HELP_SELECT_MENU_SEE_MORE_OPTIONS = 'help_see_more';

// Eval / Evaluate
const EVAL_CODE_MODAL = 'eval_code_modal';
const EVAL_CODE_INPUT = 'eval_code_input';
const ACCEPT_EVAL_CODE_EXECUTION = 'accept-eval-code-execution';
const DECLINE_EVAL_CODE_EXECUTION = 'decline-eval-code-execution';

const ZERO_WIDTH_SPACE_CHAR_CODE = 8203;


module.exports = {
  EMBED_MAX_FIELDS_LENGTH,
  EMBED_MAX_CHARACTER_LENGTH,

  EMBED_TITLE_MAX_LENGTH,
  EMBED_DESCRIPTION_MAX_LENGTH,
  EMBED_FIELD_NAME_MAX_LENGTH,
  EMBED_FIELD_VALUE_MAX_LENGTH,
  EMBED_FOOTER_TEXT_MAX_LENGTH,
  EMBED_AUTHOR_NAME_MAX_LENGTH,

  MESSAGE_CONTENT_MAX_LENGTH,
  SELECT_MENU_MAX_OPTIONS,
  AUTOCOMPLETE_MAX_DATA_OPTIONS,

  BYTES_IN_KIB,
  BYTES_IN_MIB,
  BYTES_IN_GIB,

  NS_IN_ONE_MS,
  NS_IN_ONE_SECOND,

  MS_IN_ONE_SECOND,
  MS_IN_ONE_MINUTE,
  MS_IN_ONE_HOUR,
  MS_IN_ONE_DAY,

  SECONDS_IN_ONE_MINUTE,
  MINUTES_IN_ONE_HOUR,
  HOURS_IN_ONE_DAY,

  DEFAULT_DECIMAL_PRECISION,

  HELP_COMMAND_SELECT_MENU,
  HELP_SELECT_MENU_SEE_MORE_OPTIONS,

  EVAL_CODE_MODAL,
  EVAL_CODE_INPUT,
  ACCEPT_EVAL_CODE_EXECUTION,
  DECLINE_EVAL_CODE_EXECUTION,

  ZERO_WIDTH_SPACE_CHAR_CODE
};
