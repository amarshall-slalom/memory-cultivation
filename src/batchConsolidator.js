const fs = require('fs');
const aiCommandBuilder = require('./aiCommandBuilder');

function getBatches(memoryFiles, batchSize) {
  if (!memoryFiles || memoryFiles.length === 0) {
    return [];
  }

  if (memoryFiles.length <= batchSize) {
    // Under limit: return single batch
    return [{
      files: memoryFiles,
      batchNumber: 1
    }];
  }

  // Over limit: split into batches recursively
  const batches = [];
  let batchNumber = 1;
  let remainingFiles = [...memoryFiles];

  while (remainingFiles.length > 0) {
    // Take up to batchSize files for this batch
    const batchFiles = remainingFiles.slice(0, batchSize);
    
    batches.push({
      files: batchFiles,
      batchNumber: batchNumber
    });

    batchNumber++;
    remainingFiles = remainingFiles.slice(batchSize);
  }

  return batches;
}

function consolidateBatch(batchFiles, config) {
  try {
    // Read all memory files
    const memories = [];
    for (const file of batchFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        memories.push(content);
      } catch (error) {
        return `Error reading file ${file}: ${error.message}`;
      }
    }

    // Build consolidation prompt
    const basePrompt = aiCommandBuilder.getPrompt(config, 'consolidate-batch');
    const memoriesText = memories.map((m, idx) => `### Memory ${idx + 1}\n${m}`).join('\n\n');
    const fullPrompt = `${basePrompt}\n\n${memoriesText}`;

    // Call AI to consolidate
    const result = aiCommandBuilder.executeAICommand(config, 'consolidate-batch', fullPrompt);
    return result;

  } catch (error) {
    return `Error consolidating batch: ${error.message}`;
  }
}

module.exports = {
  getBatches,
  consolidateBatch
};
