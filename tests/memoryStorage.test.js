const memoryStorage = require('../src/memoryStorage');
const fs = require('fs');

jest.mock('fs');
jest.mock('child_process');

describe('Memory Storage Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TDD Cycle 6: Generate file name with commit hash and date', () => {
    test('shouldGenerateFileNameWithCommitHashAndDate', () => {
      const fileName = memoryStorage.generateFileName('abc123', new Date('2024-01-15'));
      
      expect(fileName).toBe('abc123-2024-01-15.md');
    });
  });

  describe('TDD Cycle 7: Save AI output to memory directory', () => {
    test('shouldSaveAIOutputToMemoryDirectory', () => {
      const content = 'Test summary';
      const fileName = 'abc123-2024-01-15.md';
      fs.writeFileSync.mockImplementation(() => {});
      
      memoryStorage.saveMemory(fileName, content);
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.memory/abc123-2024-01-15.md'),
        content,
        'utf8'
      );
    });
  });

  describe('TDD Cycle 8: Handle file system errors', () => {
    test('shouldHandleFileSystemErrorsGracefully', () => {
      const content = 'Test summary';
      const fileName = 'abc123-2024-01-15.md';
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      expect(() => memoryStorage.saveMemory(fileName, content)).toThrow('Permission denied');
    });
  });
});
