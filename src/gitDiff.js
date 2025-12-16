const { execSync } = require('child_process');

function getStagedDiff() {
  return execSync('git diff --cached', { encoding: 'utf8' });
}

module.exports = {
  getStagedDiff
};
