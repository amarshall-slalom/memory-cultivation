const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG_PATH = '.memory-cultivation.config.json';

function loadConfig(configPath = null) {
  const configFile = configPath || path.join(process.cwd(), DEFAULT_CONFIG_PATH);

  try {
    if (fs.existsSync(configFile)) {
      const content = fs.readFileSync(configFile, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn(`Warning: Could not load config from ${configFile}:`, error.message);
  }

  // Return minimal default config
  return {
    ai: {
      command: 'copilot',
      commandArgs: ['-m', 'gpt-4o-mini']
    },
    instructionFiles: ['.github/copilot/COPILOT_INSTRUCTIONS.md'],
    memoryDirectory: '.memory'
  };
}

module.exports = {
  loadConfig
};
