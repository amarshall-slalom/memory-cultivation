const aiConsolidation = require('../src/aiConsolidation');

describe('AI Consolidation Module', () => {
  describe('TDD Cycle 15: Generate consolidation suggestions', () => {
    test('shouldGenerateConsolidatedLearningSuggestions', async () => {
      const mockMemories = [
        '## Summary\n\nAdded error handling for file operations',
        '## Summary\n\nRefactored module structure for better testability'
      ];
      const mockInstructions = 'Current instructions for the AI assistant';
      
      const suggestions = await aiConsolidation.generateConsolidationSuggestions(mockMemories, mockInstructions);
      
      expect(suggestions).toBeDefined();
      expect(typeof suggestions).toBe('string');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    test('shouldHandleEmptyMemories', async () => {
      const mockMemories = [];
      const mockInstructions = 'Current instructions';
      
      const suggestions = await aiConsolidation.generateConsolidationSuggestions(mockMemories, mockInstructions);
      
      expect(suggestions).toBeDefined();
      expect(typeof suggestions).toBe('string');
    });

    test('shouldHandleNoInstructions', async () => {
      const mockMemories = ['Memory 1', 'Memory 2'];
      const mockInstructions = '';
      
      const suggestions = await aiConsolidation.generateConsolidationSuggestions(mockMemories, mockInstructions);
      
      expect(suggestions).toBeDefined();
      expect(typeof suggestions).toBe('string');
    });
  });
});
