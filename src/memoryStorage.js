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

function appendMemory(summary, timestamp) {
  const branchFile = getBranchFileName();
  if (!branchFile) {
    return; // Skip if on main/master
  }
  
  const filePath = path.join(process.cwd(), branchFile);
  const branchName = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  
  // Format timestamp as YYYY-MM-DD HH:MM:SS in local time
  const year = timestamp.getFullYear();
  const month = String(timestamp.getMonth() + 1).padStart(2, '0');
  const day = String(timestamp.getDate()).padStart(2, '0');
  const hours = String(timestamp.getHours()).padStart(2, '0');
  const minutes = String(timestamp.getMinutes()).padStart(2, '0');
  const seconds = String(timestamp.getSeconds()).padStart(2, '0');
  const formattedTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
  let content;
  let commitNumber = 1;
  
  if (fs.existsSync(filePath)) {
    // File exists - append
    const existing = fs.readFileSync(filePath, 'utf8');
    
    // Count existing commits
    const commitMatches = existing.match(/## Commit \d+/g) || [];
    commitNumber = commitMatches.length + 1;
    
    content = existing + `\n## Commit ${commitNumber} - ${formattedTimestamp}\n\n${summary}\n\n---\n`;
  } else {
    // File doesn't exist - create with header
    content = `# Memory for branch: ${branchName}\n\n## Commit ${commitNumber} - ${formattedTimestamp}\n\n${summary}\n\n---\n`;
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
}

function saveMemory(fileName, content) {
  const filePath = path.join(process.cwd(), '.memory', fileName);
  fs.writeFileSync(filePath, content, 'utf8');
}

module.exports = {
  generateFileName,
  getBranchFileName,
  appendMemory,
  saveMemory
};
