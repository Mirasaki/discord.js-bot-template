import * as Discord from 'discord.js';
import * as DiscordAPITypes from 'discord-api-types/v10';

/**
 * Represents available permission levels
 */
export enum PermLevel {
  'User',
  'Moderator',
  'Administrator',
  'Server Owner',
  'Developer',
  'Bot Owner'
}

/**
 * Represents available cooldown types
 */
export enum CooldownTypes {
  'user',
  'member',
  'guild',
  'channel',
  'global'
}

/**
 * Internal configuration for the command
 */
export interface CommandBaseConfig {
  /**
   * Permission level string
   */
  permLevel: keyof typeof PermLevel;
  /**
   * Additional permissions the client needs to execute the command
   */
  clientPerms?: Array<Discord.PermissionResolvable>;
  /**
   * Additional permissions the member needs to execute the command
   */
  userPerms?: Array<Discord.PermissionResolvable>;
  /**
   * Disable the command completely, disregarding config
   */
  enabled?: boolean;
  /**
   * Is the command Not Safe For Work?
   */
  nsfw?: boolean;
  /**
   * Throttle command usage
   */
  cooldown?: CommandBaseCooldown;
  /**
   * Path to file, automatically set, can be overwritten, only invoked on command reloads
   */
  filePath?: string;
}

export interface APICommandConfig extends CommandBaseConfig {
  /**
   * Is the command a global command, or restricted to test server if false
   */
 global?: boolean;
}

/**
 * Represents command cooldown configuration
 */
export interface CommandBaseCooldown {
  /**
   * The type of this cooldown
   */
  type?: keyof typeof CooldownTypes;
  /**
   * The amount of times the command can be used within the specified duration
   */
  usages?: number;
  /**
   * The duration (in seconds) usages should be tracked for
   */
  duration?: number;
}

export interface CommandBaseRunArguments {
  /**
   * The Discord API interaction that was received
   */
  interaction: Discord.ChatInputCommandInteraction;
  /**
   * Our extended discord.js client
   */
  client: Client;
}

/**
 * Represents a Base Command Interaction
 */
export interface CommandBase {
  /**
   * Internal configuration for the command
   */
  config: CommandBaseConfig;
  /**
   * Discord ApplicationCommandData
   */
  data: DiscordAPITypes.APIApplicationCommand;
  /**
   * The function that is executed when the command is called
   */
  run(config: CommandBaseRunArguments): void | Promise<void>;
  /**
   * Replaces the permission string by the permission integer
   */
  setPermLevel(): void;
  /**
   * Validates the command module configuration
   */
  validateConfig(): void;
}

/**
 * Represents a Discord ApplicationCommandData object, with an added category field
 */
export interface ChatInputCommandData extends DiscordAPITypes.APIApplicationCommand {
  /**
   * The command category, default is parent folder name - only used internally
   */
  category?: string;
}

/**
 * Represents a Chat Input Application Command
 */
export interface ChatInputCommand extends CommandBase {
  /**
   * Discord API command data
   */
  data: ChatInputCommandData;
  /**
   * Reloads the command internally, does NOT update API data
   */
  reload(): void;
  /**
   * Runs additional checks to make sure the command is configured properly
   */
  runAdditionalChecks(): void;
}

export interface APICommand extends CommandBase {
}

export interface ComponentCommand extends CommandBase {
}

export interface UserContextCommand extends CommandBase {
}

export interface MessageContextCommand extends UserContextCommand {
}

export type JSONValue = 
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | {[key: string]: JSONValue}

export interface JSONObject {
  [key: string]: JSONValue;
}

export interface ClientConfigPresenceActivity {
  /**
   * The text displayed in the client activity
   */
  name: string;
  /**
   * The type of activity
   */
  type: Discord.ActivityType;
}

export interface ClientConfigPresence {
  /**
   * The client's status (online, busy, dnd, offline)
   */
  status: Discord.PresenceUpdateStatus;
  /**
   * Array of client activities
   */
  activities: Array<ClientConfigPresenceActivity>;
}

export interface ClientConfigPermissions {
  /**
   * The Discord user id of the bot owner
   */
  ownerId: string;
  /**
   * Array of Discord user id's representing active developers
   * with elevated permissions
   */
  developers: Array<string>;
}

export interface ClientConfiguration {
  /**
   * Required gateway intent bits
   * Required since v13
   */
  intents: Array<Discord.GatewayIntentBits>;
  /**
   * Client presence configuration
   */
  presence: ClientConfigPresence;
  /**
   * Internal permission configuration
   */
  permissions: ClientConfigPermissions;
  /**
   * The link to the Discord server where bot support is offered
   */
  supportServerInviteLink: string;
}

export interface ClientColorConfiguration {
  /**
   * The main color/primary color. Used in most embeds.
   */
  main: string;
  /**
   * The color that appears invisible in Discord dark mode
   * Can be configured to prefer light mode instead
   */
  invisible: string;
  /**
   * The color used in embeds that display a success message
   */
  success: string;
  /**
   * The color used in embeds that display an error
   */
  error: string;
  /**
   * Extend to your heart's content: /src/config/colors.json
   */
  [key: string]: JSONValue;
}

export interface ClientEmojiConfiguration {
  /**
   * Emoji prefix that indicates a successful operation/action
   */
  success: string;
  /**
   * Emoji prefix that indicates something went wrong
   */
  error: string;
  /**
   * Emojis prefix that indicates the client is processing
   * or the user has to wait for an action to complete
   */
  wait: string;
  /**
   * Emoji prefix that indicates a general tip
   */
  info: string;
  /**
   * Emoji prefix used as a separator
   */
  separator: string;
  /**
   * Extend to your heart's content: /src/config/emojis.json
   */
  [key: string]: JSONValue;
}

export interface ClientContainer {
  /**
   * Represents a Collection of ChatInputCommand
   */
  commands: Discord.Collection<string, ChatInputCommand>;
  /**
   * Represents a Collection of Context Menu commands
   */
  contextMenus: Discord.Collection<string, UserContextCommand | MessageContextCommand>;
  /**
   * Represents a Collection of Component/Button Commands
   */
  buttons: Discord.Collection<string, ComponentCommand>;
  /**
   * Represents a Collection of Component/Modal Commands
   */
  modals: Discord.Collection<string, ComponentCommand>;
  /**
   * Represents a Collection of Component/Autocomplete Commands
   */
  autoCompletes: Discord.Collection<string, ComponentCommand>;
  /**
   * Represents a Collection of Component/SelectMenu Commands
   */
  selectMenus: Discord.Collection<string, ComponentCommand>;
  /**
   * The discord client configuration
   */
  config: ClientConfiguration;
  /**
   * An object with defined color keys
   */
  colors: ClientColorConfiguration;
  /**
   * An object with defined emoji keys
   */
  emojis: ClientEmojiConfiguration;
}

export interface ClientEventCallback {
  (client: Client): void | Promise<void>;
}

export interface InteractionEventCallback {
  (client: Client, interaction: Discord.ChatInputCommandInteraction): void | Promise<void>;
}

export interface AutoCompleteInteractionEventCallback {
  (client: Client, interaction: Discord.AutocompleteInteraction): void | Promise<void>
}

export interface GuildEventCallback {
  (client: Client, guild: Discord.Guild): void | Promise<void>;
}

/**
 * Our extended discord.js client
 */
export interface Client extends Discord.Client {
  /**
   * The container that holds all our client extensions
   */
  container: ClientContainer;
}