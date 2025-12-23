const batchConsolidator = require('../src/batchConsolidator');
const aiCommandBuilder = require('../src/aiCommandBuilder');
const fs = require('fs');
const readline = require('readline');

jest.mock('../src/aiCommandBuilder');
jest.mock('fs');
jest.mock('readline');

describe('Batch Consolidator Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TDD Cycle 16: Batch splitting logic', () => {
    describe('shouldReturnSingleBatchWhenUnderLimit', () => {
      test('should return single batch with all files when under limit', () => {
        const memoryFiles = [
          '.memory/file1.md',
          '.memory/file2.md',
          '.memory/file3.md',
          '.memory/file4.md',
          '.memory/file5.md'
        ];
        const batchSize = 20;

        const batches = batchConsolidator.getBatches(memoryFiles, batchSize);

        expect(batches).toHaveLength(1);
        expect(batches[0].files).toHaveLength(5);
        expect(batches[0].files).toEqual(memoryFiles);
        expect(batches[0].batchNumber).toBe(1);
      });

      test('should handle exactly at limit', () => {
        const memoryFiles = Array.from({ length: 20 }, (_, i) => `.memory/file${i}.md`);
        const batchSize = 20;

        const batches = batchConsolidator.getBatches(memoryFiles, batchSize);

        expect(batches).toHaveLength(1);
        expect(batches[0].files).toHaveLength(20);
        expect(batches[0].batchNumber).toBe(1);
      });
    });

    describe('shouldSplitInHalfWhenOverLimit', () => {
      test('should create first batch with half of files when over limit', () => {
        const memoryFiles = Array.from({ length: 40 }, (_, i) => `.memory/file${i}.md`);
        const batchSize = 20;

        const batches = batchConsolidator.getBatches(memoryFiles, batchSize);

        expect(batches.length).toBeGreaterThan(1);
        expect(batches[0].files).toHaveLength(20);
        expect(batches[0].batchNumber).toBe(1);
        // First batch should have oldest files (file0 through file19)
        expect(batches[0].files[0]).toBe('.memory/file0.md');
        expect(batches[0].files[19]).toBe('.memory/file19.md');
      });
    });

    describe('shouldRecursivelySplitLargeSets', () => {
      test('should create multiple batches for 100 files', () => {
        const memoryFiles = Array.from({ length: 100 }, (_, i) => `.memory/file${i}.md`);
        const batchSize = 20;

        const batches = batchConsolidator.getBatches(memoryFiles, batchSize);

        // Verify no batch exceeds limit
        batches.forEach(batch => {
          expect(batch.files.length).toBeLessThanOrEqual(20);
        });

        // Verify all files are included
        const allFiles = batches.flatMap(b => b.files);
        expect(allFiles).toHaveLength(100);

        // Verify batch numbers are sequential
        batches.forEach((batch, index) => {
          expect(batch.batchNumber).toBe(index + 1);
        });

        // Verify oldest files in first batch
        expect(batches[0].files[0]).toBe('.memory/file0.md');
      });

      test('should handle odd numbers correctly', () => {
        const memoryFiles = Array.from({ length: 75 }, (_, i) => `.memory/file${i}.md`);
        const batchSize = 20;

        const batches = batchConsolidator.getBatches(memoryFiles, batchSize);

        batches.forEach(batch => {
          expect(batch.files.length).toBeLessThanOrEqual(20);
        });

        const allFiles = batches.flatMap(b => b.files);
        expect(allFiles).toHaveLength(75);
      });
    });
  });

  describe('TDD Cycle 17: Batch consolidation with AI', () => {
    describe('shouldConsolidateBatchUsingConfiguredModel', () => {
      test('should use consolidate-batch operation from config', () => {
        const batchFiles = ['.memory/file1.md', '.memory/file2.md'];
        const config = {
          ai: {
            command: 'copilot',
            operations: {
              'consolidate-batch': {
                model: 'gpt-5',
                prompt: 'Consolidate these memories'
              }
            }
          }
        };

        // Mock file reading
        fs.readFileSync.mockReturnValueOnce('Memory 1 content');
        fs.readFileSync.mockReturnValueOnce('Memory 2 content');

        // Mock AI response
        aiCommandBuilder.getPrompt.mockReturnValue('Consolidate these memories');
        aiCommandBuilder.executeAICommand.mockReturnValue('Consolidated result');

        const result = batchConsolidator.consolidateBatch(batchFiles, config);

        expect(fs.readFileSync).toHaveBeenCalledTimes(2);
        expect(aiCommandBuilder.executeAICommand).toHaveBeenCalledWith(
          config,
          'consolidate-batch',
          expect.stringContaining('Memory 1 content')
        );
        expect(result).toBe('Consolidated result');
      });

      test('should pass all batch memories to AI prompt', () => {
        const batchFiles = ['.memory/a.md', '.memory/b.md', '.memory/c.md'];
        const config = { ai: { command: 'copilot' } };

        fs.readFileSync.mockReturnValueOnce('Memory A');
        fs.readFileSync.mockReturnValueOnce('Memory B');
        fs.readFileSync.mockReturnValueOnce('Memory C');

        aiCommandBuilder.getPrompt.mockReturnValue('Base prompt');
        aiCommandBuilder.executeAICommand.mockReturnValue('Result');

        batchConsolidator.consolidateBatch(batchFiles, config);

        const callArgs = aiCommandBuilder.executeAICommand.mock.calls[0][2];
        expect(callArgs).toContain('Memory A');
        expect(callArgs).toContain('Memory B');
        expect(callArgs).toContain('Memory C');
      });
    });

    describe('shouldHandleConsolidationErrors', () => {
      test('should return error message when AI fails', () => {
        const batchFiles = ['.memory/file1.md'];
        const config = { ai: { command: 'copilot' } };

        fs.readFileSync.mockReturnValue('Memory content');
        aiCommandBuilder.getPrompt.mockReturnValue('Prompt');
        aiCommandBuilder.executeAICommand.mockImplementation(() => {
          throw new Error('AI service unavailable');
        });

        const result = batchConsolidator.consolidateBatch(batchFiles, config);

        expect(result).toContain('Error');
        expect(result).toContain('AI service unavailable');
      });

      test('should handle file read errors gracefully', () => {
        const batchFiles = ['.memory/missing.md'];
        const config = { ai: { command: 'copilot' } };

        fs.readFileSync.mockImplementation(() => {
          throw new Error('File not found');
        });

        const result = batchConsolidator.consolidateBatch(batchFiles, config);

        expect(result).toContain('Error');
        expect(result).toContain('File not found');
      });
    });
  });

  describe('TDD Cycle 18: Save consolidated memories', () => {
    describe('shouldSaveConsolidatedMemoryWithTimestamp', () => {
      test('should save consolidated memory to .memory directory', () => {
        const content = 'Consolidated content here';
        const originalFiles = ['.memory/file1.md', '.memory/file2.md'];
        const timestamp = 1734901234567;

        const filename = batchConsolidator.saveConsolidatedMemory(content, originalFiles, timestamp);

        expect(filename).toBe('.memory/consolidated-1734901234567.md');
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          '.memory/consolidated-1734901234567.md',
          expect.any(String),
          'utf8'
        );
      });

      test('should use current timestamp if not provided', () => {
        const content = 'Test content';
        const originalFiles = ['.memory/a.md'];
        const now = Date.now();
        
        jest.spyOn(Date, 'now').mockReturnValue(now);

        const filename = batchConsolidator.saveConsolidatedMemory(content, originalFiles);

        expect(filename).toBe(`.memory/consolidated-${now}.md`);
        
        Date.now.mockRestore();
      });
    });

    describe('shouldIncludeMetadataInConsolidatedFile', () => {
      test('should include file count, date range, and timestamp in header', () => {
        const content = 'Behavioral changes:\n- Added auth\n\nStructural changes:\n- Refactored';
        const originalFiles = [
          '.memory/file1-2024-12-01.md',
          '.memory/file2-2024-12-05.md',
          '.memory/file3-2024-12-10.md'
        ];
        const timestamp = 1734901234567; // Dec 22, 2024

        batchConsolidator.saveConsolidatedMemory(content, originalFiles, timestamp);

        const savedContent = fs.writeFileSync.mock.calls[0][1];
        
        // Should include metadata header
        expect(savedContent).toContain('# Consolidated Memory');
        expect(savedContent).toContain('**Original files**: 3');
        expect(savedContent).toContain('**Consolidated**: 2024-12-22');
        
        // Should include the actual content
        expect(savedContent).toContain('Behavioral changes:');
        expect(savedContent).toContain('- Added auth');
      });

      test('should extract date range from filenames', () => {
        const content = 'Test';
        const originalFiles = [
          '.memory/abc123-2024-12-01.md',
          '.memory/def456-2024-12-15.md'
        ];
        const timestamp = Date.now();

        batchConsolidator.saveConsolidatedMemory(content, originalFiles, timestamp);

        const savedContent = fs.writeFileSync.mock.calls[0][1];
        
        expect(savedContent).toContain('**Date range**: 2024-12-01 to 2024-12-15');
      });

      test('should handle files without dates in metadata', () => {
        const content = 'Test';
        const originalFiles = ['.memory/no-date.md'];
        const timestamp = Date.now();

        batchConsolidator.saveConsolidatedMemory(content, originalFiles, timestamp);

        const savedContent = fs.writeFileSync.mock.calls[0][1];
        
        // Should still work, just no date range
        expect(savedContent).toContain('# Consolidated Memory');
        expect(savedContent).toContain('**Original files**: 1');
      });
    });
  });

  describe('TDD Cycle 19: Interactive batch approval workflow', () => {
    describe('shouldPromptUserForBatchApproval', () => {
      test('should display consolidated text to user', async () => {
        const consolidatedText = 'Consolidated summary:\n- Feature A\n- Feature B';
        const batchInfo = { batchNumber: 1, totalBatches: 3, fileCount: 13 };
        
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const mockRl = {
          question: jest.fn((prompt, callback) => callback('y')),
          close: jest.fn()
        };
        readline.createInterface.mockReturnValue(mockRl);

        await batchConsolidator.promptForApproval(consolidatedText, batchInfo);

        const consoleOutput = consoleSpy.mock.calls.map(call => call[0]).join(' ');
        expect(consoleOutput).toContain('Batch 1/3');
        expect(consoleOutput).toContain('13');
        
        consoleSpy.mockRestore();
      });

      test('should show batch info when prompting', async () => {
        const consolidatedText = 'Test content';
        const batchInfo = { batchNumber: 1, totalBatches: 1, fileCount: 5 };
        
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const mockRl = {
          question: jest.fn((prompt, callback) => callback('y')),
          close: jest.fn()
        };
        readline.createInterface.mockReturnValue(mockRl);

        await batchConsolidator.promptForApproval(consolidatedText, batchInfo);

        // Check console output includes batch info and options
        const consoleOutput = consoleSpy.mock.calls.map(call => call[0]).join(' ');
        expect(consoleOutput).toContain('Batch 1/1');
        expect(consoleOutput).toContain('y');
        expect(consoleOutput).toContain('n');
        expect(consoleOutput).toContain('edit');
        expect(consoleOutput).toContain('retry');
        
        consoleSpy.mockRestore();
      });
    });

    describe('shouldHandleUserApproval', () => {
      test('should return approve action when user types y', async () => {
        const consolidatedText = 'Test';
        const batchInfo = { batchNumber: 1, totalBatches: 1, fileCount: 5 };
        
        const mockRl = {
          question: jest.fn((prompt, callback) => callback('y')),
          close: jest.fn()
        };
        readline.createInterface.mockReturnValue(mockRl);

        const result = await batchConsolidator.promptForApproval(consolidatedText, batchInfo);

        expect(result.action).toBe('approve');
        expect(result.approved).toBe(true);
        expect(result.customText).toBeNull();
      });

      test('should return skip action when user types n', async () => {
        const consolidatedText = 'Test';
        const batchInfo = { batchNumber: 1, totalBatches: 1, fileCount: 5 };
        
        const mockRl = {
          question: jest.fn((prompt, callback) => callback('n')),
          close: jest.fn()
        };
        readline.createInterface.mockReturnValue(mockRl);

        const result = await batchConsolidator.promptForApproval(consolidatedText, batchInfo);

        expect(result.action).toBe('skip');
        expect(result.approved).toBe(false);
        expect(result.customText).toBeNull();
      });
    });

    describe('shouldAllowUserToWriteOwnSummary', () => {
      test('should prompt for custom text when user types edit', async () => {
        const consolidatedText = 'AI generated text';
        const batchInfo = { batchNumber: 1, totalBatches: 1, fileCount: 5 };
        
        const mockRl = {
          question: jest.fn()
            .mockImplementationOnce((prompt, callback) => callback('edit'))
            .mockImplementationOnce((prompt, callback) => callback('My custom summary text')),
          close: jest.fn()
        };
        readline.createInterface.mockReturnValue(mockRl);

        const result = await batchConsolidator.promptForApproval(consolidatedText, batchInfo);

        expect(mockRl.question).toHaveBeenCalledTimes(2);
        expect(result.action).toBe('approve');
        expect(result.approved).toBe(true);
        expect(result.customText).toBe('My custom summary text');
      });
    });

    describe('shouldHandleUserRetry', () => {
      test('should return retry action when user types retry', async () => {
        const consolidatedText = 'Test';
        const batchInfo = { batchNumber: 1, totalBatches: 1, fileCount: 5 };
        
        const mockRl = {
          question: jest.fn((prompt, callback) => callback('retry')),
          close: jest.fn()
        };
        readline.createInterface.mockReturnValue(mockRl);

        const result = await batchConsolidator.promptForApproval(consolidatedText, batchInfo);

        expect(result.action).toBe('retry');
        expect(result.approved).toBe(false);
        expect(result.customText).toBeNull();
      });
    });
  });
});
