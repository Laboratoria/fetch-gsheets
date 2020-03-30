#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const minimist = require('minimist');
const fetchGSheets = require('..');
const pkg = require('../package.json');


const help = () => `Usage: ${pkg.name} [options] <selector-1> [...<selector-N>]

Command expects one or more "selectors" as arguments.

Each selector is a string with the following format:

'<spreadSheetId>!<sheetId>!<range>'

For example:

${pkg.name} '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!SCL!A1:I'

In this example

* spreadSheetId: '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB'
* sheetId: 'SCL'
* rangeL 'A1:I'

Options:

-c, --credentials Path to service account key file. Default: credentials.json
-h, --help        Show this help.
-v, --version     Show ${pkg.name} version.

For more info please check https://github.com/Laboratoria/fetch-gsheets
`;


if (module === require.main) {
  const { _: sources, ...opts } = minimist(process.argv.slice(2));

  if (opts.h || opts.help) {
    console.log(help());
    process.exit(0);
  }

  if (opts.v || opts.version) {
    console.log(pkg.version);
    process.exit(0);
  }

  const credentialsFile = path.resolve(opts.c || opts.credentials || 'credentials.json');
  const credentialsDir = path.dirname(credentialsFile);
  const tokenFile = path.join(credentialsDir, 'token.json');
  const parsedSources = sources.map((source) => {
    const sepIdx = source.indexOf('!');
    return {
      spreadsheetId: source.slice(0, sepIdx),
      range: source.slice(sepIdx + 1),
    };
  });

  promisify(fs.readFile)(credentialsFile)
    .then(content => fetchGSheets(parsedSources, {
      ...opts,
      credentials: JSON.parse(content),
      tokenFile,
    }))
    .then(results => console.log(JSON.stringify(results, null, 2)))
    .catch(err => console.error(err) || process.exit(1));
}
