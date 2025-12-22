const aiCommandBuilder = require('../src/aiCommandBuilder');
const { execSync } = require('child_process');

jest.mock('child_process');

describe('AI Command Builder Module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('TDD Cycle 15a: Configurable AI command execution', () => {
    describe('shouldExecuteConfiguredAICommandWithArgs', () => {
      test('should build command with command and commandArgs array', () => {
        const config = {
          ai: {
            command: 'copilot',
            commandArgs: ['--model', 'gpt-5-mini']
          }
        };
        const prompt = 'Test prompt';

        const result = aiCommandBuilder.buildCommand(config, 'test', prompt);

        expect(result.command).toContain('copilot');
        expect(result.command).toContain('-m');
        expect(result.command).toContain('gpt-5-mini');
        expect(result.promptFile).toBeTruthy();
        expect(result.prompt).toBe(prompt);
      });

      test('should build command with string-based command containing args', () => {
        const config = {
          ai: {
            command: 'copilot -s --agent memory'
          }
        };
        const prompt = 'Test prompt';

        const result = aiCommandBuilder.buildCommand(config, 'test', prompt);

        expect(result.command).toContain('copilot');
        expect(result.command).toContain('-s');
        expect(result.command).toContain('--agent');
        expect(result.command).toContain('memory');
      });

      test('should execute command and return output', () => {
        const config = {
          ai: {
            command: 'copilot',
            commandArgs: ['--model', 'gpt-5-mini']
          }
        };
        const prompt = 'Test prompt';
        
        execSync.mockReturnValue('AI response output');

        const result = aiCommandBuilder.executeAICommand(config, 'test', prompt);

        expect(execSync).toHaveBeenCalled();
        expect(result).toBe('AI response output');
      });

      test('should properly escape prompt content for shell execution', () => {
        const config = {
          ai: {
            command: 'copilot'
          }
        };
        const prompt = 'Test with "quotes" and $special chars';

        const result = aiCommandBuilder.buildCommand(config, 'test', prompt);

        // Prompt is stored in file, not in command string
        expect(result.prompt).toBe(prompt);
        expect(result.promptFile).toBeTruthy();
      });
    });

    describe('shouldReadAIConfigFromConfigFile', () => {
      test('should read ai.command from config', () => {
        const config = {
          ai: {
            command: 'copilot',
            commandArgs: ['--model', 'gpt-5-mini']
          }
        };

        const aiConfig = aiCommandBuilder.getAIConfig(config);

        expect(aiConfig.command).toBe('copilot');
        expect(aiConfig.commandArgs).toEqual(['--model', 'gpt-5-mini']);
      });

      test('should use operation-specific commandArgs if provided', () => {
        const config = {
          ai: {
            command: 'copilot',
            commandArgs: ['--model', 'gpt-5-mini'],
            operations: {
              summarize: {
                commandArgs: ['-m', 'gpt-4o', '--verbose']
              }
            }
          }
        };

        const aiConfig = aiCommandBuilder.getAIConfig(config, 'summarize');

        expect(aiConfig.commandArgs).toEqual(['-m', 'gpt-4o', '--verbose']);
      });

      test('should fall back to default command if config missing', () => {
        const config = {};

        const aiConfig = aiCommandBuilder.getAIConfig(config);

        expect(aiConfig.command).toBe('copilot');
        expect(aiConfig.commandArgs).toEqual(['--model', 'gpt-5-mini']);
      });

      test('should validate command format', () => {
        const invalidConfig = {
          ai: {
            command: ''
          }
        };

        expect(() => {
          aiCommandBuilder.getAIConfig(invalidConfig);
        }).toThrow('AI command cannot be empty');
      });
    });

    describe('shouldGetPromptForOperation', () => {
      test('should return operation-specific prompt from config', () => {
        const config = {
          ai: {
            operations: {
              summarize: {
                prompt: 'Summarize this diff'
              }
            }
          }
        };

        const prompt = aiCommandBuilder.getPrompt(config, 'summarize');

        expect(prompt).toBe('Summarize this diff');
      });

      test('should return default prompt if operation not configured', () => {
        const config = {
          ai: {
            operations: {}
          }
        };

        const prompt = aiCommandBuilder.getPrompt(config, 'unknown');

        expect(prompt).toBeTruthy();
        expect(typeof prompt).toBe('string');
      });
    });
  });
});
