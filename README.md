# fetch-gsheets

`fetch-gsheets` is a command line tool used to retrieve data from Google
Spreadsheets.

[![Build Status](https://travis-ci.com/Laboratoria/fetch-gsheets.svg?branch=master)](https://travis-ci.com/Laboratoria/fetch-gsheets)

## Installation

Global install:

```sh
npm install --global Laboratoria/fetch-gsheets

# the same thing but using shortcuts ;-)
npm i -g Laboratoria/fetch-gsheets
```

As project _devDependency_:

```sh
npm install --save-dev Laboratoria/fetch-gsheets

# the same thing but using shortcuts ;-)
npm i -D Laboratoria/fetch-gsheets
```

***

## Usage

```
Usage: fetch-gsheets [options] <selector-1> [...<selector-N>]

Command expects one or more "selectors" as arguments.

Each selector is a string with the following format:

'<spreadSheetId>!<sheetId>!<range>'

For example:

fetch-gsheets '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!SCL!A1:I'

In this example

* spreadSheetId: '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB'
* sheetId: 'SCL'
* rangeL 'A1:I'

Options:

-c, --credentials Path to OAuth Client ID JSON file. Default: credentials.json
-h, --help        Show this help.
-v, --version     Show fetch-gsheets version.

For more info please check https://github.com/Laboratoria/fetch-gsheets
```

***

## Authentication

Before you use the `fetch-gsheets` command you will need to create a _project_
in the [Google Cloud Console](https://console.cloud.google.com/),
[enable access to the _Google Sheets API_](https://cloud.google.com/apis/docs/enable-disable-apis)
for that project and create an _OAuth Client ID_. After creating a project in
Google Cloud and enabling access to the _Google Sheets API_, to get an
_OAuth Client ID_ (the credentials for `fetch-gsheets`), follow these steps:

1. Go to https://console.cloud.google.com/apis/credentials.

   ![1](https://user-images.githubusercontent.com/110297/54376357-e1bb7e80-4650-11e9-8282-26dc104bf9c1.png)

2. Select `Create credentials`, then `OAuth Client ID`.

   ![2](https://user-images.githubusercontent.com/110297/54376358-e1bb7e80-4650-11e9-9f09-436c3d9b9a15.png)

3. Pick `other` in the application type radio selector, give a name to the
   client ID (something for you to remember what this client id is for) and
   click on the `Create` button.

   ![3](https://user-images.githubusercontent.com/110297/54376359-e2541500-4650-11e9-9bf0-48027296b4a9.png)

4. Dismiss the confirmation dialog after clicking

   ![4](https://user-images.githubusercontent.com/110297/54376360-e2541500-4650-11e9-8721-6e850cac552c.png)

5. Finally click on the download button next to the newly generated OAuth 2.0
   client ID in the list.

   ![5](https://user-images.githubusercontent.com/110297/54376361-e2541500-4650-11e9-8fb9-466346e57336.png)

This file is expected to be an _OAuth 2.0 Client ID_. Something like:

```json
{
  "installed": {
    "client_id":"557161231987-cjdfhbhatdov4idv3irt6js4jkv9248a.apps.googleusercontent.com",
    "project_id":"your-amazing-project",
    "auth_uri":"https://accounts.google.com/o/oauth2/auth",
    "token_uri":"https://www.googleapis.com/oauth2/v3/token",
    "auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs",
    "client_secret":"asd7123-abcbdyasd123ertg",
    "redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]
  }
}
```

By default, `fetch-gsheets` will look for a file called `credentials.json` in
the _current working directory_ (that is the directory from where
`fetch-gsheets` was invoked).

You can also specify a different path to the _credentials_ file using the `-c`
(short version) or `--credentials` (long version) options.

```sh
fetch-gsheets \
  -c ./path/to/oauth-client-id.json \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!SCL!A1:I'
```

```sh
fetch-gsheets \
  --credentials ./path/to/oauth-client-id.json \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!SCL!A1:I'
```

### Sign in

When `fetch-gsheets` runs, it checks if an auth token already exists (in the same
dir as the credentials file - that's the _OAuth Client ID_ JSON file). If it
does not exist, you will be prompted to authorize the app (the `fetch-gsheets`
command) as follows:

```
$ fetch-gsheets \
  -c ./Downloads/client_secret_1234567890-abcdeovs2hetkgmpm4mui70283pth3a2.apps.googleusercontent.com.json \
  '1Tviny8HzskBKP0HDKXoSClqyHsvQTO0XsWnyKWZGvJA!General!A1:H5'

Authorize this app by visiting this url: https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fspreadsheets.readonly&response_type=code&client_id=897165371071-hgj5qovs2hetkgmpm4mui70283pth3a2.apps.googleusercontent.com&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob
Enter the code from that page here:
```

You should open the link in a web browser and follow the steps on the screen:

Finally, enter the token back in the console:

```
Enter the code from that page here: xxxxx
Token stored to /home/lupo/Downloads/token.json
[
  // data goes here
]
```

Subsequent calls to `fetch-gsheets` will not prompt for authentication and will
run directly.

```
$ fetch-gsheets \
  -c ./Downloads/client_secret_1234567890-abcdeovs2hetkgmpm4mui70283pth3a2.apps.googleusercontent.com.json \
  '1Tviny8HzskBKP0HDKXoSClqyHsvQTO0XsWnyKWZGvJA!General!A1:H5'
[
  // data goes here
]
```

***

## Examples

NOTE: In the examples below we assume there is a `credentials.json` file with a
service account key in the directory where we are invoking `fetch-gsheets`. This
allows for no `-c` or `--credentials` options and thus simpler examples.

### Fetch a single range from a single spreadsheet:

```sh
fetch-gsheets '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!SCL!A1:I'
```

### Fetch multiple ranges from a single spreadsheet:

```sh
fetch-gsheets \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!SCL!A1:I' \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!LIM!A1:I' \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!CDMX!A1:I'
```

### Fetch multiple ranges from multiple spreadsheets:

```sh
fetch-gsheets \
  '1xH90agOPuieIAAxSaP1IYx99-G64OP937GhHJs19q2O!SCL!B4:H60' \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!Sheet1!A1:I' \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!Sheet3!A1:X'
```
