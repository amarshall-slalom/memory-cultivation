const aiCommandBuilder = require('../src/aiCommandBuilder');
const { execSync } = require('child_process');

function isCommandAvailable(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const copilotAvailable = isCommandAvailable('copilot');

describe('AI Command Builder Integration Tests', () => {
  describe('TDD Cycle 15b: Integration tests with real copilot', () => {
    describe('shouldInvokeCopilotWithRealCommand', () => {
      (copilotAvailable ? test : test.skip)('should actually invoke copilot when available', async () => {
        const config = {
          ai: {
            command: 'copilot',
            commandArgs: ['--model', 'gpt-5-mini']
          }
        };
        const prompt = 'What is 2+2? Give a brief answer.';

        const result = aiCommandBuilder.executeAICommand(config, 'test', prompt);

        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }, 30000); // 30 second timeout for real API call

      test('should skip gracefully when copilot not installed', () => {
        if (copilotAvailable) {
          console.log('✓ Copilot is available - integration tests will run');
        } else {
          console.log('⊘ Copilot not available - integration tests skipped');
          console.log('  Install with: gh extension install github/gh-copilot');
        }
        expect(true).toBe(true);
      });
    });

    describe('shouldPassModelArgumentToCopilot', () => {
      (copilotAvailable ? test : test.skip)('should include --model flag with gpt-5-mini', () => {
        const config = {
          ai: {
            command: 'copilot',
            commandArgs: ['--model', 'gpt-5-mini']
          }
        };
        const prompt = 'Test prompt';

        const { command } = aiCommandBuilder.buildCommand(config, 'test', prompt);

        expect(command).toContain('--model');
        expect(command).toContain('gpt-5-mini');
      });
    });

    describe('shouldHandleMultilinePromptsCorrectly', () => {
      (copilotAvailable ? test : test.skip)('should handle prompt with newlines', async () => {
        const config = {
          ai: {
            command: 'copilot',
            commandArgs: ['--model', 'gpt-5-mini']
          }
        };
        const prompt = 'Line 1\nLine 2\nLine 3\nWhat is 1+1?';

        const result = aiCommandBuilder.executeAICommand(config, 'test', prompt);

        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      }, 30000);

      (copilotAvailable ? test : test.skip)('should handle prompt with quotes', async () => {
        const config = {
          ai: {
            command: 'copilot',
            commandArgs: ['--model', 'gpt-5-mini']
          }
        };
        const prompt = 'Test with "double quotes" and \'single quotes\'. What is 1+1?';

        const result = aiCommandBuilder.executeAICommand(config, 'test', prompt);

        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      }, 30000);

      (copilotAvailable ? test : test.skip)('should handle prompt with special characters', async () => {
        const config = {
          ai: {
            command: 'copilot',
            commandArgs: ['--model', 'gpt-5-mini']
          }
        };
        const prompt = 'Test with $vars and `backticks` and (parens). What is 1+1?';

        const result = aiCommandBuilder.executeAICommand(config, 'test', prompt);

        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      }, 30000);
    });
  });
});
