const { execSync } = require('child_process');

function isCultivateCommit() {
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' });
  const files = stagedFiles.trim().split('\n').filter(f => f);
  
  if (files.length === 0) return false;
  
  const isAllCultivateFiles = files.every(file => 
    file.includes('COPILOT_INSTRUCTIONS') || 
    file.includes('INSTRUCTIONS') ||
    file.startsWith('.memory/')
  );
  
  return isAllCultivateFiles;
}

module.exports = {
  isCultivateCommit
};
