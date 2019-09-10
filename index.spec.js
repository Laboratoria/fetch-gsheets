const fsMock = require('fs');
const readlineMock = require('readline');
const googleapisMock = require('googleapis');
const { Readable, Writable } = require('stream');
const fetchGSheets = require('./');

jest.mock('fs');
jest.mock('readline');
jest.mock('googleapis');

describe('fetchGSheets', () => {
  beforeEach(() => {
    fsMock.readFile.mockClear();
    fsMock.writeFile.mockClear();
    googleapisMock.__oAuth2Client.generateAuthUrl.mockClear();
    googleapisMock.__oAuth2Client.getToken.mockClear();
    googleapisMock.__oAuth2Client.setCredentials.mockClear();
    googleapisMock.__spreadsheets.values.get.mockClear();
    readlineMock.createInterface.mockClear();
  });

  it('should be a function', () => {
    expect(typeof fetchGSheets).toBe('function');
  });

  it('should reject when no credentials passed in opts', () => (
    fetchGSheets()
      .then(() => {
        throw new Error('This should never happen');
      })
      .catch((err) => {
        expect(err instanceof TypeError).toBe(true);
        expect(err.message).toBe('Credentials must be an object with a property named "installed"');
      })
  ));

  it('should reject when credentials is missing client_id, client_secret or redirect_uris', () => (
    fetchGSheets([], {
      credentials: {
        installed: {},
      },
    })
      .then(() => {
        throw new Error('This should never happen');
      })
      .catch((err) => {
        expect(err instanceof TypeError).toBe(true);
        expect(err.message).toBe('Installed credentials should include client_id, client_secret and redirect_uris');
      })
  ));

  it('should reject when no tokenFile in opts', () => (
    fetchGSheets([], {
      credentials: {
        installed: {
          client_secret: 'secret',
          client_id: '1234',
          redirect_uris: ['http://1.2.3.4:56789'],
        },
      },
    })
      .then(() => {
        throw new Error('This should never happen');
      })
      .catch((err) => {
        expect(err instanceof TypeError).toBe(true);
        expect(err.message).toBe('No path to token file provided in opts');
      })
  ));

  it('should reject when bad token passed to oAuth2Client.getToken', () => {
    fsMock.readFile.mockImplementationOnce(
      (_, cb) => setTimeout(() => cb(new Error('OMG')), 0),
    );
    googleapisMock.__oAuth2Client.getToken.mockImplementationOnce(
      (_, cb) => setTimeout(() => cb(new Error('OMG')), 0),
    );

    return fetchGSheets([], {
      credentials: {
        installed: {
          client_secret: 'secret',
          client_id: '1234',
          redirect_uris: ['http://1.2.3.4:56789'],
        },
      },
      tokenFile: '/tmp/fetch-gsheets-token.json',
    })
      .then(() => {
        throw new Error('This should never happen');
      })
      .catch((err) => {
        expect(err.message).toBe('Error while trying to retrieve access token');

        expect(fsMock.readFile.mock.calls.length).toBe(1);
        expect(fsMock.readFile.mock.calls[0].length).toBe(2);
        expect(fsMock.readFile.mock.calls[0][0]).toBe('/tmp/fetch-gsheets-token.json');
        expect(typeof fsMock.readFile.mock.calls[0][1]).toBe('function');

        expect(googleapisMock.__oAuth2Client.generateAuthUrl.mock.calls.length).toBe(1);
        expect(googleapisMock.__oAuth2Client.generateAuthUrl.mock.calls[0].length).toBe(1);
        expect(googleapisMock.__oAuth2Client.generateAuthUrl.mock.calls[0][0])
          .toEqual({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
          });

        expect(readlineMock.createInterface.mock.calls.length).toBe(1);
        expect(readlineMock.createInterface.mock.calls[0].length).toBe(1);
        expect(readlineMock.createInterface.mock.calls[0][0].input instanceof Readable)
          .toBe(true);
        expect(readlineMock.createInterface.mock.calls[0][0].output instanceof Writable)
          .toBe(true);

        expect(googleapisMock.__oAuth2Client.getToken.mock.calls.length).toBe(1);
        expect(googleapisMock.__oAuth2Client.getToken.mock.calls[0].length).toBe(2);
        expect(googleapisMock.__oAuth2Client.getToken.mock.calls[0][0]).toBe(undefined);
        expect(typeof googleapisMock.__oAuth2Client.getToken.mock.calls[0][1]).toBe('function');
      });
  });

  it('should reject when fs.writeFile fails to write tokenFile', () => {
    fsMock.readFile.mockImplementationOnce(
      (_, cb) => setTimeout(() => cb(new Error('OMG')), 0),
    );
    fsMock.writeFile.mockImplementationOnce(
      (_, __, cb) => setTimeout(() => cb(new Error('Unreadable?')), 0),
    );

    return fetchGSheets([], {
      credentials: {
        installed: {
          client_secret: 'secret',
          client_id: '1234',
          redirect_uris: ['http://1.2.3.4:56789'],
        },
      },
      tokenFile: '/tmp/fetch-gsheets-token.json',
    })
      .then(() => {
        throw new Error('This should never happen');
      })
      .catch((err) => {
        expect(err.message).toBe('Unreadable?');

        expect(fsMock.readFile.mock.calls.length).toBe(1);
        expect(fsMock.readFile.mock.calls[0].length).toBe(2);
        expect(fsMock.readFile.mock.calls[0][0]).toBe('/tmp/fetch-gsheets-token.json');
        expect(typeof fsMock.readFile.mock.calls[0][1]).toBe('function');

        expect(googleapisMock.__oAuth2Client.generateAuthUrl.mock.calls.length).toBe(1);
        expect(googleapisMock.__oAuth2Client.generateAuthUrl.mock.calls[0].length).toBe(1);
        expect(googleapisMock.__oAuth2Client.generateAuthUrl.mock.calls[0][0])
          .toEqual({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
          });

        expect(readlineMock.createInterface.mock.calls.length).toBe(1);
        expect(readlineMock.createInterface.mock.calls[0].length).toBe(1);
        expect(readlineMock.createInterface.mock.calls[0][0].input instanceof Readable)
          .toBe(true);
        expect(readlineMock.createInterface.mock.calls[0][0].output instanceof Writable)
          .toBe(true);

        expect(googleapisMock.__oAuth2Client.getToken.mock.calls.length).toBe(1);
        expect(googleapisMock.__oAuth2Client.getToken.mock.calls[0].length).toBe(2);
        expect(googleapisMock.__oAuth2Client.getToken.mock.calls[0][0]).toBe(undefined);
        expect(typeof googleapisMock.__oAuth2Client.getToken.mock.calls[0][1]).toBe('function');
      });
  });

  it('should create a new token when none present and not process anything when no sources', () => {
    // jest.spyOn(global.console, 'log');
    fsMock.readFile.mockImplementationOnce(
      (_, cb) => setTimeout(() => cb(new Error('OMG'))),
    );
    googleapisMock.__oAuth2Client.getToken.mockImplementationOnce(
      (_, cb) => setTimeout(() => cb(null, 'xxx')),
    );
    return fetchGSheets([], {
      credentials: {
        installed: {
          client_secret: 'secret',
          client_id: '1234',
          redirect_uris: ['http://1.2.3.4:56789'],
        },
      },
      tokenFile: '/tmp/fetch-gsheets-token.json',
    })
      .then((results) => {
        expect(results).toEqual([]);

        expect(fsMock.readFile.mock.calls.length).toBe(1);
        expect(fsMock.readFile.mock.calls[0].length).toBe(2);
        expect(fsMock.readFile.mock.calls[0][0]).toBe('/tmp/fetch-gsheets-token.json');
        expect(typeof fsMock.readFile.mock.calls[0][1]).toBe('function');

        expect(googleapisMock.__oAuth2Client.generateAuthUrl.mock.calls.length).toBe(1);
        expect(googleapisMock.__oAuth2Client.generateAuthUrl.mock.calls[0].length).toBe(1);
        expect(googleapisMock.__oAuth2Client.generateAuthUrl.mock.calls[0][0])
          .toEqual({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
          });

        expect(readlineMock.createInterface.mock.calls.length).toBe(1);
        expect(readlineMock.createInterface.mock.calls[0].length).toBe(1);
        expect(readlineMock.createInterface.mock.calls[0][0].input instanceof Readable)
          .toBe(true);
        expect(readlineMock.createInterface.mock.calls[0][0].output instanceof Writable)
          .toBe(true);

        expect(fsMock.writeFile.mock.calls.length).toBe(1);
        expect(fsMock.writeFile.mock.calls[0].length).toBe(3);
        expect(fsMock.writeFile.mock.calls[0][0]).toBe('/tmp/fetch-gsheets-token.json');
        expect(fsMock.writeFile.mock.calls[0][1]).toBe('"xxx"');
        expect(typeof fsMock.writeFile.mock.calls[0][2]).toBe('function');

        expect(googleapisMock.__spreadsheets.values.get.mock.calls.length).toBe(0);
      });
  });

  it('should create a new token when none present and process sources', () => {
    fsMock.readFile.mockImplementationOnce(
      (_, cb) => setTimeout(() => cb(new Error('OMG'))),
    );
    googleapisMock.__oAuth2Client.getToken.mockImplementationOnce(
      (_, cb) => setTimeout(() => cb(null, 'xxx')),
    );
    googleapisMock.__spreadsheets.values.get.mockImplementationOnce(
      (source, cb) => setTimeout(() => cb(null, {
        data: {
          values: [
            ['foo', 'bar', 'baz'],
            ['1', '2', '3'],
            ['true', 'false', 'TRUE', 'FALSE'],
          ],
        },
      })),
    );
    return fetchGSheets([{}], {
      credentials: {
        installed: {
          client_secret: 'secret',
          client_id: '1234',
          redirect_uris: ['http://1.2.3.4:56789'],
        },
      },
      tokenFile: '/tmp/fetch-gsheets-token.json',
    })
      .then((results) => {
        expect(results.length).toBe(1);
        const [rows] = results;
        expect(rows.length).toBe(3);
        expect(rows[0].length).toBe(3);
        expect(rows[0][0]).toBe('foo');
        expect(rows[0][1]).toBe('bar');
        expect(rows[0][2]).toBe('baz');
        expect(rows[1][0]).toBe(1);
        expect(rows[1][1]).toBe(2);
        expect(rows[1][2]).toBe(3);
        expect(rows[2][0]).toBe(true);
        expect(rows[2][1]).toBe(false);
        expect(rows[2][2]).toBe(true);
        expect(rows[2][3]).toBe(false);

        expect(fsMock.readFile.mock.calls.length).toBe(1);
        expect(fsMock.readFile.mock.calls[0].length).toBe(2);
        expect(fsMock.readFile.mock.calls[0][0]).toBe('/tmp/fetch-gsheets-token.json');
        expect(typeof fsMock.readFile.mock.calls[0][1]).toBe('function');

        expect(googleapisMock.__oAuth2Client.generateAuthUrl.mock.calls.length).toBe(1);
        expect(googleapisMock.__oAuth2Client.generateAuthUrl.mock.calls[0].length).toBe(1);
        expect(googleapisMock.__oAuth2Client.generateAuthUrl.mock.calls[0][0])
          .toEqual({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
          });

        expect(readlineMock.createInterface.mock.calls.length).toBe(1);
        expect(readlineMock.createInterface.mock.calls[0].length).toBe(1);
        expect(readlineMock.createInterface.mock.calls[0][0].input instanceof Readable)
          .toBe(true);
        expect(readlineMock.createInterface.mock.calls[0][0].output instanceof Writable)
          .toBe(true);

        expect(fsMock.writeFile.mock.calls.length).toBe(1);
        expect(fsMock.writeFile.mock.calls[0].length).toBe(3);
        expect(fsMock.writeFile.mock.calls[0][0]).toBe('/tmp/fetch-gsheets-token.json');
        expect(fsMock.writeFile.mock.calls[0][1]).toBe('"xxx"');
        expect(typeof fsMock.writeFile.mock.calls[0][2]).toBe('function');

        expect(googleapisMock.__spreadsheets.values.get.mock.calls.length).toBe(1);
      });
  });

  it('should use existing token if found in same dir as credentials', () => {
    fsMock.readFile.mockImplementationOnce(
      (_, cb) => setTimeout(() => cb(null, '"xxx"')),
    );
    googleapisMock.__spreadsheets.values.get.mockImplementationOnce(
      (source, cb) => setTimeout(() => cb(null, {
        data: {
          values: [
            ['foo', 'bar', 'baz'],
            ['1', '2', '3'],
            ['true', 'false', 'TRUE', 'FALSE'],
          ],
        },
      })),
    );
    return fetchGSheets([{}], {
      credentials: {
        installed: {
          client_secret: 'secret',
          client_id: '1234',
          redirect_uris: ['http://1.2.3.4:56789'],
        },
      },
      tokenFile: '/tmp/fetch-gsheets-token.json',
    })
      .then((results) => {
        expect(fsMock.readFile.mock.calls.length).toBe(1);
        expect(googleapisMock.__oAuth2Client.setCredentials.mock.calls.length).toBe(1);
        expect(googleapisMock.__oAuth2Client.setCredentials.mock.calls[0].length).toBe(1);
        expect(googleapisMock.__oAuth2Client.setCredentials.mock.calls[0][0]).toBe('xxx');
        expect(googleapisMock.__oAuth2Client.generateAuthUrl.mock.calls.length).toBe(0);
        expect(readlineMock.createInterface.mock.calls.length).toBe(0);
        expect(fsMock.writeFile.mock.calls.length).toBe(0);

        expect(results.length).toBe(1);
        const [rows] = results;
        expect(rows.length).toBe(3);
        expect(rows[0].length).toBe(3);
        expect(rows[0][0]).toBe('foo');
        expect(rows[0][1]).toBe('bar');
        expect(rows[0][2]).toBe('baz');
        expect(rows[1][0]).toBe(1);
        expect(rows[1][1]).toBe(2);
        expect(rows[1][2]).toBe(3);
        expect(rows[2][0]).toBe(true);
        expect(rows[2][1]).toBe(false);
        expect(rows[2][2]).toBe(true);
        expect(rows[2][3]).toBe(false);
      });
  });
});
