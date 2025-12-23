const fs = require('fs');
const path = require('path');

function readMemoryFiles() {
  try {
    const memoryDir = path.join(process.cwd(), '.memory');
    const files = fs.readdirSync(memoryDir);
    
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => fs.readFileSync(path.join(memoryDir, f), 'utf8'));
  } catch {
    return [];
  }
}

function getMemoryFilePaths() {
  try {
    const memoryDir = path.join(process.cwd(), '.memory');
    const files = fs.readdirSync(memoryDir);
    
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(memoryDir, f));
  } catch {
    return [];
  }
}

function readInstructionFiles() {
  const instructionPath = path.join(process.cwd(), '.github', 'copilot', 'COPILOT_INSTRUCTIONS.md');
  
  if (fs.existsSync(instructionPath)) {
    return fs.readFileSync(instructionPath, 'utf8');
  }
  
  return '';
}

module.exports = {
  readMemoryFiles,
  readInstructionFiles,
  getMemoryFilePaths
};
