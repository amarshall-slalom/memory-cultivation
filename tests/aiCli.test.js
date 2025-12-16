const aiCli = require('../src/aiCli');

describe('AI CLI Module', () => {
  describe('TDD Cycle 3: Call AI CLI with diff and prompt', () => {
    test('shouldCallAICliWithDiffAndPrompt', () => {
      const mockDiff = 'diff --git a/file.js b/file.js\n+added line';
      
      const result = aiCli.summarizeDiff(mockDiff);
      
      expect(result).toContain('Summary');
      expect(typeof result).toBe('string');
    });
  });

  describe('TDD Cycle 4: Handle AI CLI errors', () => {
    test('shouldHandleEmptyDiffGracefully', () => {
      const mockDiff = '';
      
      const result = aiCli.summarizeDiff(mockDiff);
      
      expect(typeof result).toBe('string');
    });
  });
});
