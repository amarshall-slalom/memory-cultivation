const aiCli = require('../src/aiCli');
const aiCommandBuilder = require('../src/aiCommandBuilder');

jest.mock('../src/aiCommandBuilder');

describe('AI CLI Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TDD Cycle 3: Call AI CLI with diff and prompt', () => {
    test('shouldCallAICliWithDiffAndPrompt', () => {
      const mockDiff = 'diff --git a/file.js b/file.js\n+added line';
      
      // Mock the AI command builder to return fake summary
      aiCommandBuilder.executeAICommand.mockReturnValue('## Summary\n\nBehavioral: Added new feature\nStructural: Refactored code');
      aiCommandBuilder.getPrompt.mockReturnValue('Review the diff and summarize');
      
      const result = aiCli.summarizeDiff(mockDiff);
      
      expect(result).toContain('Summary');
      expect(typeof result).toBe('string');
      expect(aiCommandBuilder.executeAICommand).toHaveBeenCalledTimes(1);
    });
  });

  describe('TDD Cycle 4: Handle AI CLI errors', () => {
    test('shouldHandleEmptyDiffGracefully', () => {
      const mockDiff = '';
      
      // Empty diff should return early without calling AI
      const result = aiCli.summarizeDiff(mockDiff);
      
      expect(typeof result).toBe('string');
      expect(result).toContain('No changes detected');
      expect(aiCommandBuilder.executeAICommand).not.toHaveBeenCalled();
    });
  });
});
