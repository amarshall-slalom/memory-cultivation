const batchConsolidator = require('../src/batchConsolidator');

describe('Batch Consolidator Module', () => {
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
});
