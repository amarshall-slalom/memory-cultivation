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
      expect(execSync).toHaveBeenCalledWith("git diff --cached -- . ':(exclude)*.md'", { encoding: 'utf8' });
    });
  });

  describe('TDD Cycle 2: Handle empty diff', () => {
    test('shouldReturnEmptyStringWhenNoDiffExists', () => {
      execSync.mockReturnValue('');
      
      const diff = gitDiff.getStagedDiff();
      
      expect(diff).toBe('');
    });
  });

  describe('TDD Cycle 2a: Exclude markdown files from diff', () => {
    test('shouldExcludeMarkdownFilesFromDiff', () => {
      execSync.mockReturnValue('diff --git a/file.js b/file.js\n+added line');
      
      const diff = gitDiff.getStagedDiff();
      
      expect(execSync).toHaveBeenCalledWith(
        "git diff --cached -- . ':(exclude)*.md'",
        { encoding: 'utf8' }
      );
      expect(diff).toContain('diff --git a/file.js');
    });

    test('shouldHandleAllMarkdownVariations', () => {
      // Markdown files should be excluded: README.md, plan.md, spec.md, docs/guide.md
      execSync.mockReturnValue('diff --git a/src/code.js b/src/code.js\n+code change');
      
      const diff = gitDiff.getStagedDiff();
      
      // Verify the exclusion pattern is used
      expect(execSync).toHaveBeenCalledWith(
        "git diff --cached -- . ':(exclude)*.md'",
        { encoding: 'utf8' }
      );
      // Should only contain non-markdown changes
      expect(diff).toContain('src/code.js');
      expect(diff).not.toContain('.md');
    });
  });
});
