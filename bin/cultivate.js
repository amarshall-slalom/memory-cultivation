#!/usr/bin/env node

const fileReader = require('../src/fileReader');
const aiConsolidation = require('../src/aiConsolidation');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function run() {
  try {
    console.log('=== Memory Cultivation ===\n');
    
    const memories = fileReader.readMemoryFiles();
    const instructions = fileReader.readInstructionFiles();
    
    if (memories.length === 0) {
      console.log('No memory files found. Nothing to cultivate.');
      rl.close();
      return 0;
    }
    
    console.log(`Found ${memories.length} memory file(s)\n`);
    console.log('=== Memories ===');
    memories.forEach((memory, idx) => {
      console.log(`\n--- Memory ${idx + 1} ---`);
      console.log(memory);
    });
    
    console.log('\n=== Current Instructions ===');
    console.log(instructions || '(No instructions found)');
    
    console.log('\n\n=== AI-Generated Suggestions ===');
    console.log('Analyzing memories and generating consolidation suggestions...\n');
    
    const suggestions = await aiConsolidation.generateConsolidationSuggestions(memories, instructions);
    console.log(suggestions);
    
    console.log('\n\n=== Next Steps ===');
    console.log('Review the suggestions above and manually update your instruction files as needed.');
    console.log('Then clean up the memory files below.\n');
    
    const shouldCleanup = await question('Clean up memory files? (y/n): ');
    
    if (shouldCleanup.toLowerCase() === 'y') {
      const memoryDir = path.join(process.cwd(), '.memory');
      const files = fs.readdirSync(memoryDir).filter(f => f.endsWith('.md'));
      
      files.forEach(f => {
        fs.unlinkSync(path.join(memoryDir, f));
      });
      
      console.log(`\nDeleted ${files.length} memory file(s)`);
      
      const shouldCommit = await question('Commit cleanup? (y/n): ');
      
      if (shouldCommit.toLowerCase() === 'y') {
        execSync('git add .memory/', { stdio: 'inherit' });
        execSync('git commit -m "chore: clean up memory files after cultivation"', { stdio: 'inherit' });
        console.log('\nCleanup committed successfully');
      }
    }
    
    rl.close();
    return 0;
  } catch (error) {
    console.error('Cultivation error:', error.message);
    rl.close();
    return 1;
  }
}

if (require.main === module) {
  run().then(code => process.exit(code));
}

module.exports = { run };
