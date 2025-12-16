const { execSync } = require('child_process');

function summarizeDiff(diff) {
  const prompt = 'Review the attached diff and write a brief summary of the changes, focusing on 2 types of changes: behavioral (new functionality) and structural (refactors, style changes, etc.)';
  
  const command = `gh copilot suggest "${prompt}\n\nDiff:\n${diff.replace(/"/g, '\\"')}"`;
  
  return execSync(command, { encoding: 'utf8' });
}

module.exports = {
  summarizeDiff
};
