const fs = require('fs');
const path = require('path');

function generateFileName(commitHash, date) {
  const dateStr = date.toISOString().split('T')[0];
  return `${commitHash}-${dateStr}.md`;
}

function saveMemory(fileName, content) {
  const filePath = path.join(process.cwd(), '.memory', fileName);
  fs.writeFileSync(filePath, content, 'utf8');
}

module.exports = {
  generateFileName,
  saveMemory
};
