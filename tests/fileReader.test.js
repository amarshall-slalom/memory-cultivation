const fileReader = require('../src/fileReader');
const fs = require('fs');

jest.mock('fs');

describe('File Reader Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TDD Cycle 12: Read all memory files', () => {
    test('shouldReadAllFilesFromMemoryDirectory', () => {
      fs.readdirSync.mockReturnValue(['file1.md', 'file2.md']);
      fs.readFileSync.mockReturnValue('memory content');
      
      const memories = fileReader.readMemoryFiles();
      
      expect(memories).toHaveLength(2);
      expect(memories[0]).toContain('memory content');
    });
  });

  describe('TDD Cycle 13: Read instruction files', () => {
    test('shouldReadAllInstructionFiles', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('instruction content');
      
      const instructions = fileReader.readInstructionFiles();
      
      expect(instructions).toContain('instruction content');
    });
  });

  describe('TDD Cycle 14: Handle missing directories', () => {
    test('shouldHandleMissingMemoryDirectoryGracefully', () => {
      fs.readdirSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });
      
      const memories = fileReader.readMemoryFiles();
      
      expect(memories).toEqual([]);
    });
  });
});
