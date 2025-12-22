const memoryStorage = require('../src/memoryStorage');
const fs = require('fs');
const { execSync } = require('child_process');

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

  describe('TDD Cycle 6a: Branch name retrieval and sanitization', () => {
    test('shouldGetCurrentBranchName', () => {
      execSync.mockReturnValue('feature/add-auth\n');
      
      const branchFile = memoryStorage.getBranchFileName();
      
      expect(execSync).toHaveBeenCalledWith('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' });
      expect(branchFile).toBe('.memory/feature-add-auth.md');
    });

    test('shouldSanitizeBranchNameForFilesystem', () => {
      execSync.mockReturnValue('bugfix/issue-#123\n');
      
      const branchFile = memoryStorage.getBranchFileName();
      
      expect(branchFile).toBe('.memory/bugfix-issue-123.md');
    });

    test('shouldSkipMainBranch', () => {
      execSync.mockReturnValue('main\n');
      
      const branchFile = memoryStorage.getBranchFileName();
      
      expect(branchFile).toBeNull();
    });

    test('shouldSkipMasterBranch', () => {
      execSync.mockReturnValue('master\n');
      
      const branchFile = memoryStorage.getBranchFileName();
      
      expect(branchFile).toBeNull();
    });
  });
});
