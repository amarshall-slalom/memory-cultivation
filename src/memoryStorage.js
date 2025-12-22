const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function generateFileName(commitHash, date) {
  const dateStr = date.toISOString().split('T')[0];
  return `${commitHash}-${dateStr}.md`;
}

function getBranchFileName() {
  const branchName = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  
  // Skip main/master branches
  if (branchName === 'main' || branchName === 'master') {
    return null;
  }
  
  // Sanitize branch name for filesystem
  const sanitized = branchName
    .replace(/\//g, '-')           // Replace / with -
    .replace(/[^a-zA-Z0-9\-_]/g, '-') // Replace special chars with -
    .replace(/-+/g, '-');          // Collapse consecutive dashes
  
  return `.memory/${sanitized}.md`;
}

function saveMemory(fileName, content) {
  const filePath = path.join(process.cwd(), '.memory', fileName);
  fs.writeFileSync(filePath, content, 'utf8');
}

module.exports = {
  generateFileName,
  getBranchFileName,
  saveMemory
};
