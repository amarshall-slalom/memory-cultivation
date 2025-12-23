const cultivate = require('../bin/cultivate');
const batchConsolidator = require('../src/batchConsolidator');
const fileReader = require('../src/fileReader');
const configReader = require('../src/configReader');
const fs = require('fs');

jest.mock('../src/batchConsolidator');
jest.mock('../src/fileReader');
jest.mock('../src/configReader');
jest.mock('fs');
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn((query, callback) => callback('n')),
    close: jest.fn()
  }))
}));

describe('Cultivate Integration - TDD Cycle 20', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock default config
    configReader.loadConfig.mockReturnValue({
      cultivation: { batchSize: 20 }
    });
  });

  describe('shouldRunBatchConsolidationBeforeFinal', () => {
    test('should run batch consolidation when memory count exceeds batchSize', async () => {
      // Set up scenario with 50 memory files
      const memoryFiles = Array.from({ length: 50 }, (_, i) => 
        `.memory/file${i}-2024-12-${String(i % 30 + 1).padStart(2, '0')}.md`
      );
      
      fileReader.readMemoryFiles.mockReturnValue(
        memoryFiles.map(f => `Memory content for ${f}`)
      );
      fileReader.readInstructionFiles.mockReturnValue('Current instructions');
      fileReader.getMemoryFilePaths.mockReturnValue(memoryFiles);
      
      // Mock batches (50 files / 20 = 3 batches)
      const batches = [
        { files: memoryFiles.slice(0, 20), batchNumber: 1 },
        { files: memoryFiles.slice(20, 40), batchNumber: 2 },
        { files: memoryFiles.slice(40, 50), batchNumber: 3 }
      ];
      batchConsolidator.getBatches.mockReturnValue(batches);
      
      // Mock consolidation results
      batchConsolidator.consolidateBatch.mockReturnValue('Consolidated memory');
      
      // Mock user approval for all batches
      batchConsolidator.promptForApproval.mockResolvedValue({
        action: 'approve',
        approved: true,
        customText: null
      });
      
      // Mock file operations
      batchConsolidator.saveConsolidatedMemory.mockReturnValue('.memory/consolidated-123.md');
      fs.unlinkSync = jest.fn();
      
      // Run cultivation
      const exitCode = await cultivate.run();
      
      // Verify batches were created
      expect(batchConsolidator.getBatches).toHaveBeenCalledWith(memoryFiles, 20);
      
      // Verify consolidation called for each batch
      expect(batchConsolidator.consolidateBatch).toHaveBeenCalledTimes(3);
      
      // Verify user prompted for each batch
      expect(batchConsolidator.promptForApproval).toHaveBeenCalledTimes(3);
      
      expect(exitCode).toBe(0);
    });

    test('should create consolidated files when user approves', async () => {
      const memoryFiles = Array.from({ length: 25 }, (_, i) => `.memory/file${i}.md`);
      
      fileReader.readMemoryFiles.mockReturnValue(memoryFiles.map(f => `Content ${f}`));
      fileReader.readInstructionFiles.mockReturnValue('Instructions');
      fileReader.getMemoryFilePaths.mockReturnValue(memoryFiles);
      
      const batches = [
        { files: memoryFiles.slice(0, 20), batchNumber: 1 },
        { files: memoryFiles.slice(20, 25), batchNumber: 2 }
      ];
      batchConsolidator.getBatches.mockReturnValue(batches);
      batchConsolidator.consolidateBatch.mockReturnValue('Consolidated');
      batchConsolidator.promptForApproval.mockResolvedValue({
        action: 'approve',
        approved: true,
        customText: null
      });
      batchConsolidator.saveConsolidatedMemory.mockReturnValue('.memory/consolidated-123.md');
      fs.unlinkSync = jest.fn();
      
      await cultivate.run();
      
      // Verify consolidated files saved
      expect(batchConsolidator.saveConsolidatedMemory).toHaveBeenCalledTimes(2);
    });

    test('should delete original files when user approves batch', async () => {
      const memoryFiles = Array.from({ length: 25 }, (_, i) => `.memory/file${i}.md`);
      const batchFiles = memoryFiles.slice(0, 20);
      
      fileReader.readMemoryFiles.mockReturnValue(memoryFiles.map(() => 'Content'));
      fileReader.readInstructionFiles.mockReturnValue('Instructions');
      fileReader.getMemoryFilePaths.mockReturnValue(memoryFiles);
      
      batchConsolidator.getBatches.mockReturnValue([{ files: batchFiles, batchNumber: 1 }]);
      batchConsolidator.consolidateBatch.mockReturnValue('Consolidated');
      batchConsolidator.promptForApproval.mockResolvedValue({
        action: 'approve',
        approved: true,
        customText: null
      });
      batchConsolidator.saveConsolidatedMemory.mockReturnValue('.memory/consolidated-123.md');
      fs.unlinkSync = jest.fn();
      
      await cultivate.run();
      
      // Verify original files deleted (20 files in first batch)
      expect(fs.unlinkSync).toHaveBeenCalledTimes(20);
      expect(fs.unlinkSync).toHaveBeenCalledWith('.memory/file0.md');
      expect(fs.unlinkSync).toHaveBeenCalledWith('.memory/file19.md');
    });

    test('should skip batch and keep originals when user declines', async () => {
      const memoryFiles = Array.from({ length: 25 }, (_, i) => `.memory/file${i}.md`);
      
      fileReader.readMemoryFiles.mockReturnValue(memoryFiles.map(() => 'Content'));
      fileReader.readInstructionFiles.mockReturnValue('Instructions');
      fileReader.getMemoryFilePaths.mockReturnValue(memoryFiles);
      
      batchConsolidator.getBatches.mockReturnValue([
        { files: memoryFiles.slice(0, 20), batchNumber: 1 }
      ]);
      batchConsolidator.consolidateBatch.mockReturnValue('Consolidated');
      batchConsolidator.promptForApproval.mockResolvedValue({
        action: 'skip',
        approved: false,
        customText: null
      });
      fs.unlinkSync = jest.fn();
      
      await cultivate.run();
      
      // Verify files NOT deleted
      expect(fs.unlinkSync).not.toHaveBeenCalled();
      
      // Verify consolidated file NOT saved
      expect(batchConsolidator.saveConsolidatedMemory).not.toHaveBeenCalled();
    });

    test('should use custom text when user chooses edit', async () => {
      const memoryFiles = Array.from({ length: 25 }, (_, i) => `.memory/file${i}.md`);
      
      fileReader.readMemoryFiles.mockReturnValue(memoryFiles.map(() => 'Content'));
      fileReader.readInstructionFiles.mockReturnValue('Instructions');
      fileReader.getMemoryFilePaths.mockReturnValue(memoryFiles);
      
      batchConsolidator.getBatches.mockReturnValue([
        { files: memoryFiles.slice(0, 20), batchNumber: 1 },
        { files: memoryFiles.slice(20, 25), batchNumber: 2 }
      ]);
      batchConsolidator.consolidateBatch.mockReturnValue('AI text');
      batchConsolidator.promptForApproval.mockResolvedValue({
        action: 'approve',
        approved: true,
        customText: 'User custom summary'
      });
      batchConsolidator.saveConsolidatedMemory.mockReturnValue('.memory/consolidated-123.md');
      fs.unlinkSync = jest.fn();
      
      await cultivate.run();
      
      // Verify custom text used instead of AI text (first batch)
      expect(batchConsolidator.saveConsolidatedMemory).toHaveBeenCalledWith(
        'User custom summary',
        memoryFiles.slice(0, 20),
        expect.any(Number)
      );
    });

    test('should retry consolidation when user requests retry', async () => {
      const memoryFiles = Array.from({ length: 25 }, (_, i) => `.memory/file${i}.md`);
      
      fileReader.readMemoryFiles.mockReturnValue(memoryFiles.map(() => 'Content'));
      fileReader.readInstructionFiles.mockReturnValue('Instructions');
      fileReader.getMemoryFilePaths.mockReturnValue(memoryFiles);
      
      batchConsolidator.getBatches.mockReturnValue([
        { files: memoryFiles.slice(0, 20), batchNumber: 1 }
      ]);
      batchConsolidator.consolidateBatch
        .mockReturnValueOnce('First attempt')
        .mockReturnValueOnce('Second attempt');
      
      // First prompt: retry, second prompt: approve
      batchConsolidator.promptForApproval
        .mockResolvedValueOnce({ action: 'retry', approved: false, customText: null })
        .mockResolvedValueOnce({ action: 'approve', approved: true, customText: null });
      
      batchConsolidator.saveConsolidatedMemory.mockReturnValue('.memory/consolidated-123.md');
      fs.unlinkSync = jest.fn();
      
      await cultivate.run();
      
      // Verify consolidation called twice (original + retry)
      expect(batchConsolidator.consolidateBatch).toHaveBeenCalledTimes(2);
      
      // Verify prompted twice
      expect(batchConsolidator.promptForApproval).toHaveBeenCalledTimes(2);
    });

    test('should skip batch consolidation when under batchSize', async () => {
      // Only 10 memory files (under default 20 batch size)
      const memoryFiles = Array.from({ length: 10 }, (_, i) => `.memory/file${i}.md`);
      
      fileReader.readMemoryFiles.mockReturnValue(memoryFiles.map(f => `Content ${f}`));
      fileReader.readInstructionFiles.mockReturnValue('Instructions');
      fileReader.getMemoryFilePaths.mockReturnValue(memoryFiles);
      
      await cultivate.run();
      
      // Verify batch consolidation NOT triggered
      expect(batchConsolidator.getBatches).not.toHaveBeenCalled();
      expect(batchConsolidator.consolidateBatch).not.toHaveBeenCalled();
    });
  });
});
