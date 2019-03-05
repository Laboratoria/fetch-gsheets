# fetch-gsheets

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

-c, --credentials Path to service account key file. Default: credentials.json
-h, --help        Show this help.
-v, --version     Show fetch-gsheets version.

For more info please check https://github.com/Laboratoria/fetch-gsheets
```

### Authentication

Before you use the `fetch-gsheets` command you will need to create a _project_
in the [Google Cloud Console](https://console.cloud.google.com/),
then create and download a _Service Account Key_.

By default, `fetch-gsheets` will look for a file called `credentials.json` in
the _current working directory_ (that is the directory from where
`fetch-gsheets` was invoked). This file is expected to be a _Service Account
Key_. Something like:

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

You can also specify a different path to the _credentials_ file using the `-c`
(short version) or `--credentials` (long version) options.

```sh
fetch-gsheets \
  -c ./path/to/service-account-key.json \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!SCL!A1:I'
```

```sh
fetch-gsheets \
  --credentials ./path/to/service-account-key.json \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!SCL!A1:I'
```

### Examples

NOTE: In the examples below we assume there is a `credentials.json` file with a
service account key in the directory where we are invoking `fetch-gsheets`. This
allows for no `-c` or `--credentials` options and thus simpler examples.

#### Fetch a single range from a single spreadsheet:

```sh
fetch-gsheets '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!SCL!A1:I'
```

#### Fetch multiple ranges from a single spreadsheet:

```sh
fetch-gsheets \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!SCL!A1:I' \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!LIM!A1:I' \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!CDMX!A1:I'
```

#### Fetch multiple ranges from multiple spreadsheets:

```sh
fetch-gsheets \
  '1xH90agOPuieIAAxSaP1IYx99-G64OP937GhHJs19q2O!SCL!B4:H60' \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!Sheet1!A1:I' \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!Sheet3!A1:X'
```
