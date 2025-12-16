const smokeTest = require('../src/smokeTest');

describe('Smoke Test', () => {
  test('shouldReturnTrue', () => {
    expect(smokeTest()).toBe(true);
  });
});
