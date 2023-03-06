/* eslint-disable no-template-curly-in-string */
const config = {
  branches: [ 'main' ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/git',
    '@semantic-release/github'
  ]
};

module.exports = config;
