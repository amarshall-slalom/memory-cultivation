const aiConsolidation = require('../src/aiConsolidation');
const aiCommandBuilder = require('../src/aiCommandBuilder');

jest.mock('../src/aiCommandBuilder');

describe('AI Consolidation Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TDD Cycle 15: Generate consolidation suggestions', () => {
    test('shouldGenerateConsolidatedLearningSuggestions', async () => {
      const mockMemories = [
        '## Summary\n\nAdded error handling for file operations',
        '## Summary\n\nRefactored module structure for better testability'
      ];
      const mockInstructions = 'Current instructions for the AI assistant';
      
      // Mock the AI command builder to return fake response
      aiCommandBuilder.executeAICommand.mockReturnValue('Suggested improvements:\n1. Add error handling patterns\n2. Document testability approach');
      aiCommandBuilder.getPrompt.mockReturnValue('Review memories and suggest improvements');
      
      const suggestions = await aiConsolidation.generateConsolidationSuggestions(mockMemories, mockInstructions);
      
      expect(suggestions).toBeDefined();
      expect(typeof suggestions).toBe('string');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(aiCommandBuilder.executeAICommand).toHaveBeenCalledTimes(1);
    });

    test('shouldHandleEmptyMemories', async () => {
      const mockMemories = [];
      const mockInstructions = 'Current instructions';
      
      const suggestions = await aiConsolidation.generateConsolidationSuggestions(mockMemories, mockInstructions);
      
      expect(suggestions).toBe('No memories to consolidate.');
      expect(aiCommandBuilder.executeAICommand).not.toHaveBeenCalled();
    });

    test('shouldHandleNoInstructions', async () => {
      const mockMemories = ['Memory 1', 'Memory 2'];
      const mockInstructions = '';
      
      // Mock the AI response
      aiCommandBuilder.executeAICommand.mockReturnValue('Consolidation result for empty instructions');
      aiCommandBuilder.getPrompt.mockReturnValue('Review memories');
      
      const suggestions = await aiConsolidation.generateConsolidationSuggestions(mockMemories, mockInstructions);
      
      expect(suggestions).toBeDefined();
      expect(typeof suggestions).toBe('string');
      expect(aiCommandBuilder.executeAICommand).toHaveBeenCalledTimes(1);
    });
  });
});
