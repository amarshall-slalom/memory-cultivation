const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_CONFIG = {
  command: 'copilot',
  commandArgs: ['-m', 'gpt-4o-mini']
};

const DEFAULT_PROMPTS = {
  summarize: 'Review the attached diff and write a brief summary of the changes, focusing on 2 types of changes: behavioral (new functionality) and structural (refactors, style changes, etc.)',
  consolidate: 'You are reviewing accumulated memories from code commits to help improve AI assistant instructions. Review the memories and suggest specific additions or improvements to the instructions.'
};

function getAIConfig(config, operation = null) {
  if (!config || !config.ai) {
    return DEFAULT_CONFIG;
  }

  const baseCommand = config.ai.command;
  if (!baseCommand || baseCommand.trim() === '') {
    throw new Error('AI command cannot be empty');
  }

  let commandArgs = config.ai.commandArgs || [];

  // Check for operation-specific overrides
  if (operation && config.ai.operations && config.ai.operations[operation]) {
    const opConfig = config.ai.operations[operation];
    if (opConfig.commandArgs) {
      commandArgs = opConfig.commandArgs;
    }
  }

  return {
    command: baseCommand,
    commandArgs: commandArgs
  };
}

function getPrompt(config, operation) {
  if (config && config.ai && config.ai.operations && config.ai.operations[operation]) {
    const opConfig = config.ai.operations[operation];
    if (opConfig.prompt) {
      return opConfig.prompt;
    }
  }

  return DEFAULT_PROMPTS[operation] || DEFAULT_PROMPTS.summarize;
}

function buildCommand(config, operation, prompt) {
  const aiConfig = getAIConfig(config, operation);
  
  // Handle command as string with embedded args or as separate command + args
  let baseCommand = aiConfig.command;
  let args = aiConfig.commandArgs || [];

  // If command contains spaces, it likely has args embedded
  if (baseCommand.includes(' ')) {
    const parts = baseCommand.split(/\s+/);
    baseCommand = parts[0];
    args = [...parts.slice(1), ...args];
  }

  // Create temporary file for prompt to avoid shell escaping issues
  const tmpDir = os.tmpdir();
  const promptFile = path.join(tmpDir, `ai-prompt-${Date.now()}.txt`);
  
  // Build the command string
  const argsStr = args.length > 0 ? ' ' + args.join(' ') : '';
  const command = `${baseCommand}${argsStr}`;

  return {
    command,
    promptFile,
    prompt
  };
}

function executeAICommand(config, operation, prompt) {
  const { command, promptFile, prompt: promptText } = buildCommand(config, operation, prompt);

  try {
    // Write prompt to temp file
    fs.writeFileSync(promptFile, promptText);

    // Execute command with prompt from file
    const result = execSync(`${command} < ${promptFile}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Clean up
    fs.unlinkSync(promptFile);

    return result;
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(promptFile)) {
      fs.unlinkSync(promptFile);
    }
    throw error;
  }
}

module.exports = {
  buildCommand,
  executeAICommand,
  getAIConfig,
  getPrompt
};
