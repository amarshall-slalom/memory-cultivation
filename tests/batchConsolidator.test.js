const batchConsolidator = require('../src/batchConsolidator');
const aiCommandBuilder = require('../src/aiCommandBuilder');
const fs = require('fs');

jest.mock('../src/aiCommandBuilder');
jest.mock('fs');

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
});
