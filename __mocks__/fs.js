exports.readFile = jest.fn().mockImplementation((p, cb) => setTimeout(() => cb()));

exports.writeFile = jest.fn().mockImplementation((p, content, cb) => setTimeout(() => cb()));
