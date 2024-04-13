# [3.4.0](https://github.com/Mirasaki/discord.js-bot-template/compare/v3.3.0...v3.4.0) (2023-09-22)


### Bug Fixes

* Avoid overwriting original description in cleanAPIData ([bed40d4](https://github.com/Mirasaki/discord.js-bot-template/commit/bed40d41b1321bd3c045e149f6af92653e139e04))
* config file import path ([f35c2ed](https://github.com/Mirasaki/discord.js-bot-template/commit/f35c2ed8241869e4a5eeab07c30454388124b0b7))
* context menu command identification ([5ad8085](https://github.com/Mirasaki/discord.js-bot-template/commit/5ad8085909993c90e4dbb47fd59a3180bc4c1423))
* discriminator deprecation ([9714318](https://github.com/Mirasaki/discord.js-bot-template/commit/9714318d7ae89b13545801ea45c66f7287b52e9d))
* emoji before tag in `/permlevel` ([e3c67dc](https://github.com/Mirasaki/discord.js-bot-template/commit/e3c67dcbfe5088cd864d200f0a794f763bdcd0f9))
* resolve BigInt permissions into human readable ([d1209c3](https://github.com/Mirasaki/discord.js-bot-template/commit/d1209c3338a890c757200519e3c67d60f31f77d6))
* slice command descriptions for cmd select menu ([195a5e9](https://github.com/Mirasaki/discord.js-bot-template/commit/195a5e9d2fe2703b9b5c79ab03e7efb7ea60c29a))
* use activeOption for identifying missing handlers ([6d454a9](https://github.com/Mirasaki/discord.js-bot-template/commit/6d454a967f45cbed411396035ff4471054a8b91e))
* use res#json over #send for wider serialization support ([454c10a](https://github.com/Mirasaki/discord.js-bot-template/commit/454c10a01d54f9bbb028b64072f56305373585b4))
* wrong command data from being display when API command data validation fails ([70d57bc](https://github.com/Mirasaki/discord.js-bot-template/commit/70d57bc75b9fab6ff6aac253806a756278089d4f))


### Features

* add status endpoint to express API ([673e093](https://github.com/Mirasaki/discord.js-bot-template/commit/673e093fc515b92919d3b1f360ab8504648444b1))
* global ephemeral replies for system messages ([5259ca9](https://github.com/Mirasaki/discord.js-bot-template/commit/5259ca9770faf3af0476f07068935ccff5650c70))
* use single client config import ([5edb477](https://github.com/Mirasaki/discord.js-bot-template/commit/5edb4779d398c263caace02e381d452c75c45511))

# [3.3.0](https://github.com/Mirasaki/discord.js-bot-template/compare/v3.2.0...v3.3.0) (2023-04-15)


### Bug Fixes

* avoid circular dependency resolving clientConfig ([169d819](https://github.com/Mirasaki/discord.js-bot-template/commit/169d8197eb0a79f2eec9f54b13967f585e97098f))
* **Command:** properly set config.cooldown.duration ([3bf277b](https://github.com/Mirasaki/discord.js-bot-template/commit/3bf277b3da15a9554a1d41df6a44092c7006778e))


### Features

* `/set-name` command ([bfae3a2](https://github.com/Mirasaki/discord.js-bot-template/commit/bfae3a214802e5d27c61ea2137d242a49945a77b))
* `set-avatar` command ([7bae016](https://github.com/Mirasaki/discord.js-bot-template/commit/7bae01640e32050531bbb1f14883dcf8df774d3a))
* add `msToHumanReadableTime` util fn ([ee41cd8](https://github.com/Mirasaki/discord.js-bot-template/commit/ee41cd8cbcac4864fff1369eab76f414d3b105df))
* add changelog and package version to semantic-release ([598675d](https://github.com/Mirasaki/discord.js-bot-template/commit/598675d5a07acf98b00b776ced69d142cb25a08b))
* allow dynamic button actions ([abfb331](https://github.com/Mirasaki/discord.js-bot-template/commit/abfb3314669dfea1aa8b383792bc79e0aaaf9ea3))
* provide additional configuration for `/invite` ([259762c](https://github.com/Mirasaki/discord.js-bot-template/commit/259762cc062bd82b4f45d02470d2600613e22e12))
