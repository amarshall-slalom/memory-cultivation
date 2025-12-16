const cultivateDetector = require('../src/cultivateDetector');
const { execSync } = require('child_process');

jest.mock('child_process');

describe('Cultivate Detector Module', () => {
  describe('TDD Cycle 9: Detect cultivate commits', () => {
    test('shouldDetectCommitWithOnlyInstructionAndMemoryChanges', () => {
      execSync.mockReturnValue('.github/copilot/COPILOT_INSTRUCTIONS.md\n.memory/abc123.md');
      
      const isCultivate = cultivateDetector.isCultivateCommit();
      
      expect(isCultivate).toBe(true);
    });

    test('shouldNotDetectNormalCommitsAsCultivate', () => {
      execSync.mockReturnValue('src/index.js\nREADME.md');
      
      const isCultivate = cultivateDetector.isCultivateCommit();
      
      expect(isCultivate).toBe(false);
    });
  });
});
