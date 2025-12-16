const gitDiff = require('../src/gitDiff');
const { execSync } = require('child_process');

jest.mock('child_process');

describe('Git Diff Module', () => {
  describe('TDD Cycle 1: Fetch staged diff', () => {
    test('shouldFetchStagedDiffWhenFilesAreStaged', () => {
      execSync.mockReturnValue('diff --git a/file.js b/file.js\n+added line');
      
      const diff = gitDiff.getStagedDiff();
      
      expect(diff).toContain('diff --git');
      expect(diff).toContain('+added line');
      expect(execSync).toHaveBeenCalledWith('git diff --cached', { encoding: 'utf8' });
    });
  });

  describe('TDD Cycle 2: Handle empty diff', () => {
    test('shouldReturnEmptyStringWhenNoDiffExists', () => {
      execSync.mockReturnValue('');
      
      const diff = gitDiff.getStagedDiff();
      
      expect(diff).toBe('');
    });
  });
});
