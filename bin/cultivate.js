#!/usr/bin/env node

const fileReader = require('../src/fileReader');
const aiConsolidation = require('../src/aiConsolidation');
const batchConsolidator = require('../src/batchConsolidator');
const configReader = require('../src/configReader');
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

async function runBatchConsolidation(memoryFilePaths, config) {
  const batchSize = config?.cultivation?.batchSize || 20;
  
  // Skip batch consolidation if under threshold
  if (memoryFilePaths.length <= batchSize) {
    return memoryFilePaths;
  }
  
  console.log('\n=== Phase 1: Batch Consolidation ===');
  console.log(`You have ${memoryFilePaths.length} memories. Let's consolidate them in batches.\n`);
  
  const batches = batchConsolidator.getBatches(memoryFilePaths, batchSize);
  const remainingFiles = [];
  
  for (const batch of batches) {
    const processedFiles = await processBatch(batch, batches.length, config);
    remainingFiles.push(...processedFiles);
  }
  
  return remainingFiles;
}

async function processBatch(batch, totalBatches, config) {
  let retry = true;
  
  while (retry) {
    console.log(`\n⏳ Processing batch ${batch.batchNumber}/${totalBatches} (${batch.files.length} memories)...`);
    
    // Generate consolidation
    const consolidated = batchConsolidator.consolidateBatch(batch.files, config);
    
    // Get user approval
    const batchInfo = {
      batchNumber: batch.batchNumber,
      totalBatches: totalBatches,
      fileCount: batch.files.length
    };
    
    const approval = await batchConsolidator.promptForApproval(consolidated, batchInfo);
    
    // Handle user decision
    const result = handleBatchApproval(approval, consolidated, batch);
    
    if (result.retry) {
      continue; // Retry loop
    }
    
    return result.files;
  }
}

function handleBatchApproval(approval, consolidated, batch) {
  if (approval.action === 'retry') {
    return { retry: true, files: [] };
  }
  
  if (approval.action === 'skip') {
    console.log(`⏭️  Skipped batch ${batch.batchNumber} - keeping ${batch.files.length} original files`);
    return { retry: false, files: batch.files };
  }
  
  if (approval.action === 'approve') {
    const contentToSave = approval.customText || consolidated;
    const consolidatedFile = batchConsolidator.saveConsolidatedMemory(
      contentToSave,
      batch.files,
      Date.now()
    );
    
    console.log(`\n✅ Batch ${batch.batchNumber} consolidated → ${consolidatedFile}`);
    
    // Delete originals
    batch.files.forEach(file => {
      fs.unlinkSync(file);
    });
    console.log(`   🗑️  Deleted ${batch.files.length} original memory files`);
    
    return { retry: false, files: [consolidatedFile] };
  }
  
  // Should never reach here
  return { retry: false, files: batch.files };
}

async function run() {
  try {
    console.log('=== Memory Cultivation ===\n');
    
    const config = configReader.loadConfig();
    const memories = fileReader.readMemoryFiles();
    const memoryFilePaths = fileReader.getMemoryFilePaths();
    const instructions = fileReader.readInstructionFiles();
    
    if (memories.length === 0) {
      console.log('No memory files found. Nothing to cultivate.');
      rl.close();
      return 0;
    }
    
    console.log(`Found ${memories.length} memory file(s)\n`);
    
    // Run batch consolidation if needed
    const remainingFiles = await runBatchConsolidation(memoryFilePaths, config);
    
    // If batch consolidation ran, reload memories
    const finalMemories = remainingFiles.length !== memoryFilePaths.length 
      ? fileReader.readMemoryFiles() 
      : memories;
    
    console.log('\n=== Phase 2: Final Analysis ===');
    console.log('=== Memories ===');
    finalMemories.forEach((memory, idx) => {
      console.log(`\n--- Memory ${idx + 1} ---`);
      console.log(memory);
    });
    
    console.log('\n=== Current Instructions ===');
    console.log(instructions || '(No instructions found)');
    
    console.log('\n\n=== AI-Generated Suggestions ===');
    console.log('Analyzing memories and generating consolidation suggestions...\n');
    
    const suggestions = await aiConsolidation.generateConsolidationSuggestions(finalMemories, instructions);
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
