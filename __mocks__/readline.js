exports.createInterface = jest.fn().mockReturnValue({
  question: jest.fn().mockImplementation((_, fn) => setTimeout(() => fn())),
  close: jest.fn(),
});
