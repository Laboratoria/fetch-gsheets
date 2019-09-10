exports.__oAuth2Client = {
  generateAuthUrl: jest.fn(),
  getToken: jest.fn().mockImplementation((code, cb) => setTimeout(() => cb())),
  setCredentials: jest.fn(),
};

exports.__spreadsheets = {
  values: {
    get: jest.fn().mockImplementation((source, cb) => setTimeout(() => cb(null, {
      data: { values: [] },
    }))),
  },
};

exports.google = {
  auth: {
    OAuth2: function OAuth2() {
      this.generateAuthUrl = exports.__oAuth2Client.generateAuthUrl;
      this.getToken = exports.__oAuth2Client.getToken;
      this.setCredentials = exports.__oAuth2Client.setCredentials;
    },
  },
  sheets: jest.fn().mockReturnValue({
    spreadsheets: exports.__spreadsheets,
  }),
};
