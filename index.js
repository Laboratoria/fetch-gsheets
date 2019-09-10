const fs = require('fs');
const readline = require('readline');
const { promisify } = require('util');
const { google } = require('googleapis');


const scope = ['https://www.googleapis.com/auth/spreadsheets.readonly'];


/**
 * Get and store new token after prompting for user authorization, and then
 * resolve with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {String} tokenFile Path to token file.
 */
const getNewToken = (oAuth2Client, tokenFile) => new Promise((resolve, reject) => {
  const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope });
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question([
    `Authorize this app by visiting this url: ${authUrl}`,
    'Enter the code from that page here: ',
  ].join('\n'), (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        return reject(new Error('Error while trying to retrieve access token'));
      }
      oAuth2Client.setCredentials(token);
      return promisify(fs.writeFile)(tokenFile, JSON.stringify(token))
        .then(() => {
          console.log(`Token stored to ${tokenFile}`);
          resolve(oAuth2Client);
        })
        .catch(reject);
    });
  });
});


/**
 * Create an OAuth2 client with the given credentials, and then resolve with the
 * authorized OAuth2 client.
 *
 * @param {Object} options An object with the following keys:
 *                 * {Object} credentials The authorization client credentials.
 *                 * {String} tokenFile Path to token file.
 */
const authorize = ({ credentials, tokenFile }) => {
  if (!credentials || !credentials.installed) {
    return Promise.reject(new TypeError(
      'Credentials must be an object with a property named "installed"',
    ));
  }

  // eslint-disable-next-line camelcase
  const { client_id: id, client_secret: secret, redirect_uris: uris } = credentials.installed;
  if (!id || !secret || !uris || !uris.length) {
    return Promise.reject(new TypeError(
      'Installed credentials should include client_id, client_secret and redirect_uris',
    ));
  }

  const oAuth2Client = new google.auth.OAuth2(id, secret, uris[0]);

  if (!tokenFile) {
    return Promise.reject(new TypeError(
      'No path to token file provided in opts',
    ));
  }

  // Check if we have previously stored a token.
  return promisify(fs.readFile)(tokenFile)
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
  }

  if (['true', 'false'].indexOf(lowercased) !== -1) {
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
    .then(results => results.map(resp => parseRows(resp.data.values)));
};


module.exports = (sources = [], opts = {}) => (
  authorize(opts)
    .then(oAuth2Client => fetchSheets(oAuth2Client, sources))
);
