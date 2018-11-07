# fetch-gsheets

## Installation

Global install:

```sh
npm install --global Laboratoria/fetch-gsheets
```

As project dependency:

```sh
npm install --save-dev Laboratoria/fetch-gsheets
```

## Usage

Fetch a single range from a single spreadsheet:

```sh
fetch-gsheets '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!SCL!A1:I'
```

Fetch multiple ranges from a single spreadsheet:

```sh
fetch-gsheets \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!SCL!A1:I' \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!LIM!A1:I' \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!CDMX!A1:I'
```

Fetch multiple ranges from multiple spreadsheets:

```sh
fetch-gsheets \
  '1xH90agOPuieIAAxSaP1IYx99-G64OP937GhHJs19q2O!SCL!B4:H60' \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!Sheet1!A1:I' \
  '2vG81bkFMfroZFNmCbD9SQcUo-Wed08goNrJB9Yyl9AB!Sheet3!A1:X'
```
