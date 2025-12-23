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

module.exports = {
  getBatches
};
