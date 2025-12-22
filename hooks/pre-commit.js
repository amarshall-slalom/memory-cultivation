#!/usr/bin/env node

const gitDiff = require('../src/gitDiff');
const aiCli = require('../src/aiCli');
const memoryStorage = require('../src/memoryStorage');
const cultivateDetector = require('../src/cultivateDetector');

function run() {
  try {
    // Skip if on main/master branch
    const branchFile = memoryStorage.getBranchFileName();
    if (!branchFile) {
      console.log('On main/master branch, skipping memory generation');
      return 0;
    }

    if (cultivateDetector.isCultivateCommit()) {
      console.log('Cultivate commit detected, skipping memory generation');
      return 0;
    }

    const diff = gitDiff.getStagedDiff();
    
    if (!diff || diff.trim() === '') {
      console.log('No staged changes, skipping memory generation');
      return 0;
    }

    console.log('Generating memory summary...');
    const summary = aiCli.summarizeDiff(diff);
    
    memoryStorage.appendMemory(summary, new Date());
    console.log(`Memory saved to ${branchFile}`);
    
    return 0;
  } catch (error) {
    console.error('Pre-commit hook error:', error.message);
    return 1;
  }
}

if (require.main === module) {
  process.exit(run());
}

module.exports = { run };
