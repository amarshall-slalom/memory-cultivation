const configReader = require('../src/configReader');
const fs = require('fs');

jest.mock('fs');

describe('Config Reader Module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadConfig', () => {
    test('should load config from file when it exists', () => {
      const mockConfig = {
        ai: {
          command: 'copilot',
          commandArgs: ['--model', 'gpt-5-mini']
        }
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const config = configReader.loadConfig();

      expect(config.ai.command).toBe('copilot');
      expect(config.ai.commandArgs).toEqual(['--model', 'gpt-5-mini']);
    });

    test('should return default config when file does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const config = configReader.loadConfig();

      expect(config.ai.command).toBe('copilot');
      expect(config.ai.commandArgs).toEqual(['--model', 'gpt-5-mini']);
    });

    test('should return default config on parse error', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('{ invalid json }');

      const config = configReader.loadConfig();

      expect(config.ai).toBeDefined();
      expect(config.ai.command).toBe('copilot');
    });

    test('should load from custom path when provided', () => {
      const customPath = '/custom/config.json';
      const mockConfig = {
        ai: { command: 'custom-ai' }
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const config = configReader.loadConfig(customPath);

      expect(fs.readFileSync).toHaveBeenCalledWith(customPath, 'utf-8');
      expect(config.ai.command).toBe('custom-ai');
    });
  });
});
