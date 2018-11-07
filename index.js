#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');
const minimist = require('minimist');
const { google } = require('googleapis');


const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const scope = ['https://www.googleapis.com/auth/spreadsheets.readonly'];


/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
const getNewToken = (oAuth2Client, tokenFile) => new Promise((resolve, reject) => {
  const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        return reject(new Error('Error while trying to retrieve access token'));
      }
      oAuth2Client.setCredentials(token);
      writeFile(tokenFile, JSON.stringify(token))
        .then(() => {
          console.log(`Token stored to ${tokenFile}`);
          resolve(oAuth2Client);
        })
        .catch(reject);
    });
  });
});


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 */
const authorize = ({ credentials, tokenFile }) => {
  // eslint-disable-next-line camelcase
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  return readFile(tokenFile)
    .then((token) => {
      oAuth2Client.setCredentials(JSON.parse(token));
      return oAuth2Client;
    })
    .catch(() => getNewToken(oAuth2Client, tokenFile));
};


const parseValue = (value) => {
  const trimmed = value.trim();
  const lowercased = trimmed.toLowerCase();

  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  } else if (['true', 'false'].indexOf(lowercased) !== -1) {
    return (lowercased === 'true');
  }

  return trimmed;
};


const parseRows = rows => rows.map(row => row.map(cell => parseValue(cell)));


const fetchSheets = (auth, sources) => {
  const sheets = google.sheets({ version: 'v4', auth });
  const get = promisify(
    sheets.spreadsheets.values.get.bind(sheets.spreadsheets.values),
  );

  return Promise.all(sources.map(item => get(item)))
    .then(results => results.map(resp => parseRows(resp.data.values)))
};


module.exports = (sources, opts) => (
  authorize(opts)
    .then(oAuth2Client => fetchSheets(oAuth2Client, sources))
);


if (module === require.main) {
  const { _: sources, ...opts } = minimist(process.argv.slice(2));
  const credentialsFile = path.resolve(opts.c || opts.credentials || 'credentials.json');
  const credentialsDir = path.dirname(credentialsFile);
  const tokenFile = path.join(credentialsDir, 'token.json');
  const parsedSources = sources.map(source => {
    const sepIdx = source.indexOf('!');
    return {
      spreadsheetId: source.slice(0, sepIdx),
      range: source.slice(sepIdx + 1),
    };
  });

  readFile(credentialsFile)
    .then(content => module.exports(parsedSources, {
      ...opts,
      credentials: JSON.parse(content),
      tokenFile,
    }))
    .then(results => console.log(JSON.stringify(results, null, 2)))
    .catch(err => {
      console.error(`Error loading client secret file frpm ${credentialsFile}`, err);
      return process.exit(1);
    });
}
