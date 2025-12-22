const { execSync } = require('child_process');

function getStagedDiff() {
  return execSync("git diff --cached -- . ':(exclude)*.md'", { encoding: 'utf8' });
}

module.exports = {
  getStagedDiff
};
