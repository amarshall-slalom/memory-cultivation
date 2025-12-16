const aiCli = require('../src/aiCli');
const { execSync } = require('child_process');

jest.mock('child_process');

describe('AI CLI Module', () => {
  describe('TDD Cycle 3: Call AI CLI with diff and prompt', () => {
    test('shouldCallAICliWithDiffAndPrompt', () => {
      const mockDiff = 'diff --git a/file.js b/file.js\n+added line';
      const mockResponse = 'Summary: Added new functionality';
      execSync.mockReturnValue(mockResponse);
      
      const result = aiCli.summarizeDiff(mockDiff);
      
      expect(result).toBe(mockResponse);
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('gh copilot'),
        expect.any(Object)
      );
    });
  });

  describe('TDD Cycle 4: Handle AI CLI errors', () => {
    test('shouldThrowErrorWhenAICliFailsToExecute', () => {
      const mockDiff = 'diff --git a/file.js b/file.js';
      execSync.mockImplementation(() => {
        throw new Error('AI CLI not found');
      });
      
      expect(() => aiCli.summarizeDiff(mockDiff)).toThrow('AI CLI not found');
    });
  });
});
