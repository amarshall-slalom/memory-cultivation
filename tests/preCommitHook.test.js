const preCommitHook = require('../hooks/pre-commit');
const gitDiff = require('../src/gitDiff');
const aiCli = require('../src/aiCli');
const memoryStorage = require('../src/memoryStorage');
const cultivateDetector = require('../src/cultivateDetector');

jest.mock('../src/gitDiff');
jest.mock('../src/aiCli');
jest.mock('../src/memoryStorage');
jest.mock('../src/cultivateDetector');

describe('Pre-Commit Hook Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TDD Cycle 11: Execute full pre-commit workflow', () => {
    test('shouldExecuteFullPreCommitWorkflow', () => {
      memoryStorage.getBranchFileName.mockReturnValue('.memory/feature-test.md');
      cultivateDetector.isCultivateCommit.mockReturnValue(false);
      gitDiff.getStagedDiff.mockReturnValue('diff content');
      aiCli.summarizeDiff.mockReturnValue('AI summary');
      memoryStorage.appendMemory.mockImplementation(() => {});

      const result = preCommitHook.run();

      expect(memoryStorage.getBranchFileName).toHaveBeenCalled();
      expect(cultivateDetector.isCultivateCommit).toHaveBeenCalled();
      expect(gitDiff.getStagedDiff).toHaveBeenCalled();
      expect(aiCli.summarizeDiff).toHaveBeenCalledWith('diff content');
      expect(memoryStorage.appendMemory).toHaveBeenCalled();
      expect(result).toBe(0);
    });

    test('shouldSkipHookWhenCultivateCommitDetected', () => {
      memoryStorage.getBranchFileName.mockReturnValue('.memory/feature-test.md');
      cultivateDetector.isCultivateCommit.mockReturnValue(true);

      const result = preCommitHook.run();

      expect(memoryStorage.getBranchFileName).toHaveBeenCalled();
      expect(cultivateDetector.isCultivateCommit).toHaveBeenCalled();
      expect(gitDiff.getStagedDiff).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });

    test('shouldSkipHookWhenOnMainBranch', () => {
      memoryStorage.getBranchFileName.mockReturnValue(null);

      const result = preCommitHook.run();

      expect(memoryStorage.getBranchFileName).toHaveBeenCalled();
      expect(cultivateDetector.isCultivateCommit).not.toHaveBeenCalled();
      expect(gitDiff.getStagedDiff).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });
  });
});
