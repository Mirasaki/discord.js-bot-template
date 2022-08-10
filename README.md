# discord.js-bot-template

[![CodeFactor](https://www.codefactor.io/repository/github/mirasaki/discord.js-bot-template/badge)](https://www.codefactor.io/repository/github/mirasaki/discord.js-bot-template)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is a bot template using [discord.js](https://github.com/discordjs/discord.js "discord.js on Github") for quickly and easily creating powerful [Discord](https://discord.com/ "Official Discord Website") bots. You don't need much Javascript experience to get started on a project using this template. Not sure where to start? Come join my [Discord Server](https://discord.gg/E3xejZRUFB), where I'll try and answer all the questions you have.

With [Message Content Access becoming a privileged intent](https://support-dev.discord.com/hc/en-us/articles/4404772028055-Message-Content-Access-Deprecation-for-Verified-Bots "source") I thought I'd build a template where you're pretty much ready to start working on commands after installing it. This template currently doesn't listen to the `messageCreate` event. Update Slash Commands by using the `/deploy` command or altering the environmental variables. It also uses the latest Discord features, like auto-complete, Buttons, Modals, and other components.

---

## Live Demo

Come try the template yourself in our official [support server](https://discord.gg/E3xejZRUFB)

## Showcase / Projects using this template

- [DayZ Leaderboard bot](https://github.com/Mirasaki/dayz-leaderboard-bot)
- Create a new issues if you want to have your project showcased here

## Features

Complete | Notes
-------- | ---------
✅ Built-in Slash Commands | [Message Content Access is becoming a privileged intent](https://support-dev.discord.com/hc/en-us/articles/4404772028055-Message-Content-Access-Deprecation-for-Verified-Bots "source") and that's why this template focuses on Discord's [Interaction Commands](https://discord.com/developers/docs/interactions/receiving-and-responding#interactions "Discord Interaction Documentation"). In fact, we don't even activily listen to the `messageCreate` event.
✅ Event Listener | This template comes with an event listener that doesn't use the depracated `.bind()` method.
✅ Permissions | This template handles user permission level, required command permissions and additional configurable client & user permissions.
✅ Auto complete | Discord's API auto complete is showcased in the `/help` command and `/src/listeners/interaction/autoCompleteInteraction.js` file.
✅ Developer Friendly | This template has detailed information available in the files themselves, allowing new developer's to jump right in and get started on commands.
✅ Testing Friendly | Configure your command to be *global* or *test server only*. Allowing you to test properly, and finally make it available globally.
✅ Throttling | Configure command cooldowns for all your commands. Allow infinite usages for a command that barely does anything, and restrict resource-heavy commands to 1 usage in 120 seconds.
✅ Permission | Configure a required permission level for your commands. Also configure any *additional* required [Discord Permissions](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags "All available permissions") for the client/bot and the member calling the command. Very useful for moderation functionality.
✅ Global disable & enable | Found a major bug in one of your commands? Disable it in your slash configuration export and the Slash Command will automatically be disabled, be it global or test server.
✅ NSFW channel restrictions | Configure whether or not your command is SFW and automatically restrict it to NSFW channels if it's not.
✅ Utility file | This template comes with a `/src/util.js` file which exports utility functions which will make your everyday tasks a lot easier.
✅ Extensions | Both the `client` and `member` objects have extended properties. `member.permLevel` is available in all Interaction listeners. Client has multiple extensions which are containerized: `client.container.` ->`commands`, `config`, `emoji`, `colors`
✅ Command Nesting | This template supports and encourages deep command and command-category nesting

Incomplete | Notes
---------- | -----
⌛ Add support for DM commands | At the time of writing this, Slash Commands can be called in a bots DM channel. I'd like to add full support for DM Slash Commands.

---

## Installation & Usage

---

## Prerequisites

- [NodeJS](https://nodejs.org/en/download/) (if you're running as a plain NodeJS app)
    1) Head over to the download page
    2) Download the current build (latest features) available for your OS
    3) Be sure to check the box that says "Automatically install the necessary tools" when you're running the installation wizard
- A [Discord Bot account](https://discord.com/developers/applications)
    1) Head over to the page linked above
    2) Click "New Application" in the top right
    3) Give it a cool name and click "Create"
    4) Click "Bot" in the left hand panel
    5) Click "Add Bot" -> "Yes, do it!"
    6) Click "Reset Token" and copy it to your clipboard, you will need it later

### Run as a [Docker](https://docs.docker.com/engine/install/) container (preferred)

The quickest, and easiest, way to host/use this bot is by deploying it inside of a Docker container.

1. Clone this repository: `git clone git@github.com:Mirasaki/discord.js-bot-template.git`
2. Navigate inside the new folder: `cd discord-bot-template`
3. Rename `.env.example` to `.env` and provide your environmental variables
4. Rename `config.example.js` to `config.js` and provide your configuration
5. Build the project: `docker build --tag discord-bot-template .`
6. Start the bot: `docker run -d --name discord-bot-template --env-file ./.env -p 27017:27017 discord-bot-template`

### Run as a plain NodeJS app

You can also clone this repository or download a release, and host the project directly. You will need [Node/NodeJS](https://nodejs.org/en/) (Be sure to check the box that says "Automatically install the necessary tools" when you're running the installation wizard)

1. Head over to [the download page](https://github.com/Mirasaki/discord.js-bot-template/releases/) (or clone by using: `git clone git@github.com:Mirasaki/discord.js-bot-template.git`)
2. Download either the `zip` or `zip.gz` source code
3. Extract it using [your favorite zip tool](https://www.rarlab.com/download.htm)
4. Open the folder containing your recently extracted files
5. Open a console/terminal/shell prompt in this directory
6. Run `npm i --include-dev` to install all dependencies
7. Rename `.env.example` to `.env` and configure your environmental variables
8. Rename `config.js.example` to `config.js` and go through your bot configuration
9. Use the command `node .` to start the application, `npm run start` to keep the process alive with [PM2](https://pm2.io/) (if you have this installed), or `npm run start:dev` if you have `nodemon` installed for automatic restarts on changes (active development)

### Notes

- Get a Bot Token from [the Discord developer portal](https://www.discord.com/developers) (you will need this in your `.env` file)
