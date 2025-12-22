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

  describe('TDD Cycle 6d: Error handling for branch-based storage', () => {
    test('shouldThrowErrorWhenWriteFailsInAppendMode', () => {
      execSync.mockReturnValue('feature/auth\n');
      fs.existsSync.mockReturnValue(false);
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Disk full');
      });
      
      const timestamp = new Date('2024-12-22T14:30:00');
      
      expect(() => memoryStorage.appendMemory('AI summary', timestamp)).toThrow('Disk full');
    });

    test('shouldThrowErrorWhenReadFailsInAppendMode', () => {
      execSync.mockReturnValue('feature/auth\n');
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => {
        throw new Error('Cannot read file');
      });
      
      const timestamp = new Date('2024-12-22T14:30:00');
      
      expect(() => memoryStorage.appendMemory('AI summary', timestamp)).toThrow('Cannot read file');
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

  describe('TDD Cycle 6b: Append mode for existing branch memory', () => {
    test('shouldCreateNewFileForFirstCommitOnBranch', () => {
      execSync.mockReturnValue('feature/auth\n');
      fs.existsSync.mockReturnValue(false);
      fs.writeFileSync.mockImplementation(() => {});
      
      const timestamp = new Date('2024-12-22T14:30:00');
      memoryStorage.appendMemory('AI summary here', timestamp);
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.memory/feature-auth.md'),
        expect.stringContaining('# Memory for branch: feature/auth'),
        'utf8'
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('## Commit 1 - 2024-12-22 14:30:00'),
        'utf8'
      );
    });

    test('shouldAppendToExistingBranchMemory', () => {
      execSync.mockReturnValue('feature/auth\n');
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(`# Memory for branch: feature/auth

## Commit 1 - 2024-12-22 14:30:00

First summary

---
`);
      fs.writeFileSync.mockImplementation(() => {});
      
      const timestamp = new Date('2024-12-22T15:45:00');
      memoryStorage.appendMemory('Second summary', timestamp);
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.memory/feature-auth.md'),
        expect.stringContaining('## Commit 2 - 2024-12-22 15:45:00'),
        'utf8'
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('Second summary'),
        'utf8'
      );
    });

    test('shouldIncludeTimestampInEachEntry', () => {
      execSync.mockReturnValue('feature/auth\n');
      fs.existsSync.mockReturnValue(false);
      fs.writeFileSync.mockImplementation(() => {});
      
      const timestamp = new Date('2024-12-22T14:30:45');
      memoryStorage.appendMemory('Test summary', timestamp);
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('2024-12-22 14:30:45'),
        'utf8'
      );
    });
  });

  describe('TDD Cycle 6c: Auto-stage generated memory file', () => {
    test('shouldStageMemoryFileAfterSaving', () => {
      execSync.mockReturnValue('feature/auth\n');
      fs.existsSync.mockReturnValue(false);
      fs.writeFileSync.mockImplementation(() => {});
      
      const timestamp = new Date('2024-12-22T14:30:00');
      memoryStorage.appendMemory('AI summary', timestamp);
      
      // Verify git add was called with the memory file
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('git add .memory/feature-auth.md'),
        expect.any(Object)
      );
    });

    test('shouldHandleGitAddErrors', () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('git add')) {
          throw new Error('Git add failed');
        }
        return 'feature/auth\n';
      });
      fs.existsSync.mockReturnValue(false);
      fs.writeFileSync.mockImplementation(() => {});
      
      const timestamp = new Date('2024-12-22T14:30:00');
      
      // Should not throw - hook should complete successfully
      expect(() => memoryStorage.appendMemory('AI summary', timestamp)).not.toThrow();
    });
  });
});
