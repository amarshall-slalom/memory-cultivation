# Implementation Plan for Memory Cultivation Tool - Active Work

This file contains in-progress and future work. See [plan-completed.md](./plan-completed.md) for completed phases.

## 📊 Current Status

**Phase 2 Complete!** Branch-based memory system working. Now focusing on:
- Phase 3: Memory Cultivation Command (batch consolidation)
- Phase 4: Configuration enhancements
- Phase 6: Final testing

---


## Phase 3: Memory Cultivation Command (TDD)

### 3.1 File Reading Module
- [x] **BEHAVIORAL** (TDD Cycle 12): Read memory files ✅ **COMPLETED**
  - [x] Write failing test: `shouldReadAllFilesFromMemoryDirectory`
  - [x] Implement function to read all `.memory/*.md` files
  - [x] Verify test passes
  - [x] Commit: "behavioral: read all memory files from .memory directory"

- [x] **BEHAVIORAL** (TDD Cycle 13): Read instruction files ✅ **COMPLETED** (Included in Cycle 12 commit)
  - [x] Write failing test: `shouldReadAllInstructionFiles`
  - [x] Implement function to read instruction files (e.g., `.github/copilot/COPILOT_INSTRUCTIONS.md`)
  - [x] Verify test passes
  - [x] Commit: "behavioral: read instruction files for cultivation"

- [x] **BEHAVIORAL** (TDD Cycle 14): Handle missing directories ✅ **COMPLETED** (Included in Cycle 12 commit)
  - [x] Write failing test: `shouldHandleMissingMemoryDirectoryGracefully`
  - [x] Implement error handling for missing directories
  - [x] Verify all tests pass
  - [x] Commit: "behavioral: handle missing directories in file reading"

### 3.2 AI Consolidation Module

#### 3.2.1 Initial Implementation (NEEDS REFACTORING - has bugs)
- [x] **BEHAVIORAL** (TDD Cycle 15 - INITIAL): Generate consolidation suggestions ⚠️ **BUGGY**
  - [x] Write failing test: `shouldGenerateConsolidatedLearningSuggestions`
  - [x] Implement AI call to consolidate memories into suggested instruction updates
  - [x] Verify test passes
  - [x] Commit: "behavioral: generate consolidated learning suggestions from memories"
  - **Issues Found**:
    - ❌ Uses incorrect command `gh copilot suggest` instead of just `copilot`
    - ❌ Hardcoded command in code instead of reading from config
    - ❌ No model selection (should use gpt-5-mini for cost efficiency)
    - ❌ Tests are over-mocked and don't catch real integration issues

#### 3.2.2 Configuration-Based AI CLI Support
- [x] **BEHAVIORAL** (TDD Cycle 15a): Configurable AI command execution ✅ **COMPLETED**
  - [x] Create new module `src/aiCommandBuilder.js`
  - [x] Functions: `buildCommand()`, `executeAICommand()`, `getAIConfig()`, `getPrompt()`
  - [x] Config supports `command` field and `commandArgs` array
  - [x] Per-operation configuration (summarize, consolidate)
  - [x] Tests in `tests/aiCommandBuilder.test.js` (20+ test cases)
  - [x] Update `.memory-cultivation.config.json` with AI configuration
  - [x] Proper prompt escaping for shell execution
  - [x] Verify tests pass
  - [x] Commit: "behavioral: add configurable AI command execution" (a2183eb)

- [x] **BEHAVIORAL** (TDD Cycle 15b): Integration tests with real copilot ✅ **COMPLETED**
  - [x] Create `tests/aiCommandBuilder.integration.test.js`
  - [x] Tests detect if `copilot` command is available (skip if not)
  - [x] Tests actually invoke copilot with real prompts
  - [x] Tests verify model argument (--model gpt-5-mini)
  - [x] Tests handle multiline prompts, quotes, special characters
  - [x] Refactor `src/aiCli.js` to use command builder
  - [x] Verify all tests pass (unit + integration)
  - [x] Commit: "behavioral: integrate aiCli with configurable command builder" (fa8781f)

- [x] **STRUCTURAL** (TDD Cycle 15c): Refactor and cleanup ✅ **COMPLETED**
  - [x] Update `src/aiConsolidation.js` to use configurable command builder
  - [x] Remove duplicate command execution logic (31 lines removed)
  - [x] Prompt file utilities in aiCommandBuilder (shared)
  - [x] Verify all tests pass (54/54 passing)
  - [x] Run linter (clean)
  - [x] Commit: "structural: refactor aiConsolidation to use command builder" (fa5aad3)

#### 3.2.3 Test Performance Optimization
- [ ] **CHORE** (Cycle 15.5): Speed up unit tests by mocking AI calls
  - [ ] **Problem**: Unit tests calling real GitHub Copilot AI (slow)
    - aiConsolidation.test.js: 55.5s (3 tests)
    - aiCli.test.js: 14s (2 tests)
    - Total: ~70s of unnecessary AI calls
  - [ ] **Solution**: Mock aiCommandBuilder.executeAICommand() in unit tests
  - [ ] **Steps**:
    - [ ] Add jest.mock('../src/aiCommandBuilder') to aiConsolidation.test.js
    - [ ] Mock executeAICommand to return fake AI responses
    - [ ] Update 3 tests to verify logic without real AI calls
    - [ ] Add jest.mock('../src/aiCommandBuilder') to aiCli.test.js
    - [ ] Mock executeAICommand to return fake summaries
    - [ ] Update 2 tests to verify logic without real AI calls
    - [ ] Verify aiCommandBuilder.integration.test.js still calls real AI
    - [ ] Run full test suite (all 54 tests should pass)
    - [ ] Verify total time drops from ~56s to ~15-20s
    - [ ] Run linter
  - [ ] **Expected Results**:
    - Unit tests: 70s → 2s (35x faster)
    - Integration tests: 42s (unchanged, intentionally slow)
    - Total: 56s → 15-20s (2-3x faster)
  - [ ] Commit: "chore: mock AI calls in unit tests for faster execution"

### 3.2a AI-Powered Batch Consolidation (NEW)

#### Design Overview: Progressive Memory Consolidation

**Problem**: When 100+ memory files accumulate, processing them all at once:
- Burns through API credits unnecessarily
- Produces overwhelming output for user to review
- Doesn't scale well

**Solution**: Binary tree batch consolidation approach
- Process memories in batches of ≤20
- Use recursive halving for larger sets
- User approves each consolidation
- Creates intermediate consolidated files
- Final pass suggests instruction improvements

**Note on Branch-Based Memories**: 
- With branch-based naming, you'll have fewer files but each file may be VERY long
- A single feature branch could have 50+ commits → one huge `.memory/feature-auth.md` file
- Batching still applies: Split the commit entries within the file into batches
- Or treat each branch memory file as a single "memory" for consolidation purposes

**Example Flow (100 memory files OR 100 commit entries across 5 branch files)**:
```
100 memories → split → 50 oldest
50 memories → split → 25 oldest  
25 memories → split → 13 oldest
13 memories → ✓ consolidate → consolidated-001.md (user approves)
Repeat for next 13 → consolidated-002.md
...continues until all processed
Result: 8 consolidated files + original memories deleted
Final pass: Analyze 8 consolidated files for instruction suggestions
```

#### Configuration Requirements

```json
{
  "ai": {
    "command": "copilot",
    "commandArgs": ["--model", "gpt-5-mini"],
    "operations": {
      "summarize": {
        "model": "gpt-5-mini",  // Fast, cheap for commit diffs
        "prompt": "Review the attached diff..."
      },
      "consolidate-batch": {
        "model": "gpt-4o",      // More powerful for batch consolidation
        "prompt": "You are consolidating multiple memory summaries from commits. Synthesize these memories into a single coherent summary that captures: 1) Key behavioral changes, 2) Important structural patterns, 3) Technical decisions made. Be concise but preserve important details."
      },
      "consolidate-final": {
        "model": "gpt-4o",      // Most powerful for instruction suggestions
        "prompt": "You are reviewing consolidated memories to improve AI assistant instructions. Analyze patterns and suggest specific, actionable improvements to the instructions."
      }
    }
  },
  "cultivation": {
    "batchSize": 20,            // Max memories per consolidation batch
    "autoCommit": false,
    "consolidatedFilePrefix": "consolidated-"
  }
}
```

**Note**: Model selection preference: "gpt-4o" or "claude-sonnet-4-5" (user configurable)

- [ ] **BEHAVIORAL** (TDD Cycle 16): Batch splitting logic
  - [ ] **Design Requirements**:
    - Given N memory files, determine optimal batches
    - If N ≤ batchSize (20): return single batch
    - If N > batchSize: use binary tree approach
      - Take oldest ceil(N/2) memories
      - Recursively split if still > batchSize
      - Continue until batch ≤ batchSize
    - Return array of batches with file paths
  - [ ] **Implementation Steps**:
    - [ ] Create `src/batchConsolidator.js` module
    - [ ] Write failing test: `shouldReturnSingleBatchWhenUnderLimit`
      - Input: 15 memory files, batchSize: 20
      - Expected: Single batch with all 15 files
    - [ ] Write failing test: `shouldSplitInHalfWhenOverLimit`
      - Input: 40 memory files, batchSize: 20
      - Expected: First batch has 20 oldest files
    - [ ] Write failing test: `shouldRecursivelySplitLargeSets`
      - Input: 100 memory files, batchSize: 20
      - Expected: Multiple batches, none exceeding 20
      - Verify oldest memories processed first
    - [ ] Implement `getBatches(memoryFiles, batchSize)` function
      - Sort files by timestamp (oldest first)
      - Recursive splitting logic
      - Return array of batch objects: `[{files: [...], batchNumber: 1}, ...]`
    - [ ] Verify all tests pass
    - [ ] Commit: "behavioral: add batch splitting logic for memory consolidation"

- [ ] **BEHAVIORAL** (TDD Cycle 17): Batch consolidation with AI
  - [ ] Write failing test: `shouldConsolidateBatchUsingConfiguredModel`
    - Mock aiCommandBuilder.executeAICommand
    - Verify it uses 'consolidate-batch' operation
    - Verify correct model from config
    - Verify batch memories passed to prompt
  - [ ] Write failing test: `shouldHandleConsolidationErrors`
    - Test AI failure scenarios
    - Should return error message, not crash
  - [ ] Implement `consolidateBatch(batchFiles, config)` function
    - Read all memory files in batch
    - Build consolidation prompt
    - Call aiCommandBuilder with 'consolidate-batch' operation
    - Return consolidated text
  - [ ] Verify tests pass
  - [ ] Commit: "behavioral: add AI batch consolidation capability"

- [ ] **BEHAVIORAL** (TDD Cycle 18): Save consolidated memories
  - [ ] Write failing test: `shouldSaveConsolidatedMemoryWithTimestamp`
    - Verify file saved to .memory/ directory
    - Verify naming: consolidated-{timestamp}.md
    - Verify content includes metadata (original file count, date range)
  - [ ] Write failing test: `shouldIncludeMetadataInConsolidatedFile`
    - Verify header includes: number of memories, date range, consolidation timestamp
  - [ ] Implement `saveConsolidatedMemory(content, originalFiles, timestamp)` function
    - Generate filename with timestamp
    - Add metadata header
    - Write to .memory/ directory
    - Return filename
  - [ ] Verify tests pass
  - [ ] Commit: "behavioral: save consolidated memory files with metadata"

- [ ] **BEHAVIORAL** (TDD Cycle 19): Interactive batch approval workflow
  - [ ] Write failing test: `shouldPromptUserForBatchApproval`
    - Mock readline interface
    - Verify consolidation shown to user
    - Verify approval prompt appears
  - [ ] Write failing test: `shouldHandleUserApproval`
    - User types 'y': Delete originals, save consolidated
    - User types 'n': Skip batch, keep originals
  - [ ] Write failing test: `shouldAllowUserToWriteOwnSummary`
    - User types 'edit': Prompt for custom summary
    - Save custom summary as consolidated file
    - Delete originals
  - [ ] Write failing test: `shouldHandleUserRetry`
    - User types 'retry': Re-run AI consolidation
    - Show new result
  - [ ] Implement interactive approval in `batchConsolidator.js`
    - Function: `promptForApproval(consolidatedText, batchInfo)`
    - Options: 'y' (approve), 'n' (skip), 'edit' (write own), 'retry' (regenerate)
    - Return: {approved: boolean, customText: string|null, action: 'approve'|'skip'|'retry'}
  - [ ] Verify tests pass
  - [ ] Commit: "behavioral: add interactive batch approval workflow"

- [ ] **BEHAVIORAL** (TDD Cycle 20): Integrate batch consolidation into cultivate command
  - [ ] Write integration test: `shouldRunBatchConsolidationBeforeFinal`
    - Set up scenario with 50 memory files
    - Verify batches created
    - Verify user prompted for each batch
    - Verify consolidated files created
    - Verify original files deleted (when approved)
  - [ ] Update `bin/cultivate.js`:
    - [ ] Add batch consolidation phase before final consolidation
    - [ ] Check memory count at start
    - [ ] If > batchSize: Run batch consolidation loop
      - Get batches from batchConsolidator
      - For each batch:
        - Show batch info (e.g., "Batch 1/8: consolidating 13 memories from Dec 1-5")
        - Call consolidateBatch()
        - Show result to user
        - Prompt for approval
        - Handle user response (approve/skip/edit/retry)
        - If approved: save consolidated, delete originals
    - [ ] Continue to existing final consolidation with remaining files
  - [ ] Verify integration test passes
  - [ ] Manual testing with real memory files
  - [ ] Commit: "behavioral: integrate batch consolidation into cultivate workflow"

- [ ] **STRUCTURAL** (TDD Cycle 21): Refactor and polish batch consolidation
  - [ ] Extract common prompt building logic
  - [ ] Add progress indicators (e.g., "Processing batch 3/8...")
  - [ ] Improve error messages
  - [ ] Add dry-run mode (show what would happen without executing)
  - [ ] Verify all tests still pass
  - [ ] Run linter and fix issues
  - [ ] Commit: "structural: refactor batch consolidation for clarity"

#### File Naming Convention
- Original memories: `.memory/{commit-hash}-{date}.md`
- Consolidated batches: `.memory/consolidated-{timestamp}.md`
- Consolidated files are treated as first-class memories in subsequent passes
- User can manually review/edit consolidated files before final pass

#### User Experience Flow

```
$ npm run cultivate

=== Memory Cultivation ===

Found 100 memory files

Phase 1: Batch Consolidation
-----------------------------
You have more than 20 memories. Let's consolidate them in batches.

Batch 1/8: Consolidating 13 memories (Dec 1-5, 2024)
[AI generates consolidation...]

=== Batch 1 Consolidation ===
Behavioral changes:
- Implemented JWT authentication
- Added password reset flow
...

Structural changes:
- Refactored auth module for clarity
- Renamed userId → userID pattern
...

Options:
  y - Approve consolidation (delete 13 originals, save consolidated)
  n - Skip this batch (keep originals)
  edit - Write your own summary
  retry - Regenerate with AI

Your choice: y

✓ Batch 1 consolidated → .memory/consolidated-1734901234.md
  Deleted 13 original memory files

[Continues for remaining batches...]

Phase 2: Final Analysis
-----------------------
Analyzing 8 consolidated memories for instruction improvements...

[Shows final suggestions...]
```

- [ ] **BEHAVIORAL** (TDD Cycle 16-OLD): Identify outdated information ⏸️ **DEFERRED**
  - [ ] Write failing test: `shouldIdentifyOutdatedInstructionContent`
  - [ ] Implement AI call to identify outdated/incorrect information in instructions
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: identify outdated instruction content"

### 3.3 User Interaction Module
- [x] **BEHAVIORAL** (TDD Cycle 17): Prompt for integration approval ✅ **MVP IMPLEMENTED**
  - [x] Write failing test: `shouldPromptUserForEachSuggestionWithYesNoOption`
  - [x] Implement interactive prompt for suggestions
  - [x] Verify test passes
  - [x] Commit: "behavioral: prompt user to approve learning integrations"
  - **Note**: Implemented in cultivation command (bin/cultivate.js) for cleanup workflow

- [ ] **BEHAVIORAL** (TDD Cycle 18): Prompt for removal approval ⏸️ **NOT IMPLEMENTED**
  - [ ] Write failing test: `shouldPromptUserToRemoveOutdatedContent`
  - [ ] Implement interactive prompt for removals
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: prompt user to approve content removals"
  - **Note**: Would require AI suggestions first

- [ ] **STRUCTURAL**: Refactor user interaction ⏸️ **NOT IMPLEMENTED**
  - [ ] Extract prompt logic into reusable function
  - [ ] Improve user-facing messages
  - [ ] Verify tests still pass
  - [ ] Commit: "structural: extract reusable prompt interaction logic"
  - [ ] Improve user-facing messages
  - [ ] Verify tests still pass
  - [ ] Commit: "structural: extract reusable prompt interaction logic"

### 3.4 File Update & Cleanup Module
- [ ] **BEHAVIORAL** (TDD Cycle 19): Update instruction files ⏸️ **NOT IMPLEMENTED**
  - [ ] Write failing test: `shouldUpdateInstructionFilesWithApprovedSuggestions`
  - [ ] Implement file update logic based on user approvals
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: update instruction files with approved suggestions"
  - **Note**: Would require AI suggestions and interactive editing

- [x] **BEHAVIORAL** (TDD Cycle 20): Remove memory files ✅ **MVP IMPLEMENTED**
  - [x] Write failing test: `shouldRemoveAllFilesFromMemoryDirectory`
  - [x] Implement cleanup of `.memory/` directory
  - [x] Verify test passes
  - [x] Commit: "behavioral: clean up memory directory after cultivation"
  - **Note**: Implemented in bin/cultivate.js (manual cleanup workflow)

- [x] **BEHAVIORAL** (TDD Cycle 21): Create cultivate commit ✅ **MVP IMPLEMENTED**
  - [x] Write failing test: `shouldCommitInstructionUpdatesAndMemoryCleanup`
  - [x] Implement git commit logic for cultivation changes
  - [x] Verify test passes
  - [x] Commit: "behavioral: create git commit for cultivation changes"
  - **Note**: Implemented in bin/cultivate.js (optional commit)

### 3.5 Command Integration
- [x] **BEHAVIORAL** (TDD Cycle 22): Wire cultivation workflow ✅ **MVP IMPLEMENTED**
  - [x] Write integration test: `shouldExecuteFullCultivationWorkflow`
  - [x] Connect all cultivation modules
  - [x] Verify integration test passes
  - [x] Commit: "behavioral: integrate full memory cultivation workflow"
  - **Note**: Working cultivation command in bin/cultivate.js

- [x] **STRUCTURAL**: Refactor cultivation command ✅ **COMPLETED**
  - [x] Break into smaller, focused functions
  - [x] Add progress indicators
  - [x] Verify tests still pass
  - [x] Commit: "structural: refactor cultivation command for maintainability"
  - **Note**: Built cleanly from the start

---

## Phase 4: Configuration & Flexibility

### 4.1 Configuration File Support
- [ ] **BEHAVIORAL** (TDD Cycle 23): Read configuration file (PART OF 3.2.2)
  - [ ] Write failing test: `shouldReadConfigurationFromFile`
  - [ ] Implement config file reading (JSON/YAML)
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: read configuration from file"
  - **Note**: Will be implemented as part of AI command builder (3.2.2)

- [ ] **BEHAVIORAL** (TDD Cycle 24): Support AI CLI configuration (IMPLEMENTED IN 3.2.2)
  - [ ] Write failing test: `shouldUseConfiguredAICommand`
  - [ ] Implement configurable AI command with arguments
  - [ ] Support per-operation command overrides
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: support configurable AI CLI commands"
  - **Note**: See section 3.2.2 for detailed implementation

- [ ] **BEHAVIORAL** (TDD Cycle 25): Support custom prompts (IMPLEMENTED IN 3.2.2)
  - [ ] Write failing test: `shouldUseCustomPromptTemplatesFromConfig`
  - [ ] Implement custom prompt template support per operation
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: support custom AI prompt templates"
  - **Note**: Handled by config.ai.operations structure in 3.2.2

### 4.2 Default Configuration
- [x] **STRUCTURAL**: Create default config file ✅ **COMPLETED**
  - [x] Create `.memory-cultivation.config.json` with defaults
  - [x] Document configuration options
  - [x] Commit: "structural: add default configuration file"
  - **Note**: Template exists but not yet used by code

---

## Phase 5: Documentation & Polish

### 5.1 User Documentation
- [x] **STRUCTURAL**: Create comprehensive README ✅ **COMPLETED**
  - [x] Document installation steps
  - [x] Document usage for pre-commit hook
  - [x] Document usage for cultivation command
  - [x] Add configuration examples
  - [x] Add troubleshooting section
  - [x] Commit: "structural: create comprehensive user documentation"
  - **Note**: Comprehensive README.md created

### 5.2 Developer Documentation
- [x] **STRUCTURAL**: Add developer docs ✅ **COMPLETED**
  - [x] Document architecture and design decisions
  - [x] Add contributing guidelines
  - [x] Document testing approach
  - [x] Commit: "structural: add developer documentation"
  - **Note**: IMPLEMENTATION_SUMMARY.md provides detailed developer documentation

### 5.3 Examples & Templates
- [x] **STRUCTURAL**: Add examples ✅ **PARTIALLY COMPLETED**
  - [x] Create example memory files (4 files generated automatically)
  - [x] Create example instruction files (uses existing .github/copilot/COPILOT_INSTRUCTIONS.md)
  - [x] Create example configuration files (.memory-cultivation.config.json)
  - [x] Commit: "structural: add example files and templates"
  - **Note**: Real memory files generated through usage

---

## Phase 6: Final Testing & Validation

### 6.1 End-to-End Testing
- [x] **BEHAVIORAL**: Add E2E tests ✅ **PARTIALLY COMPLETED**
  - [x] Write E2E test for complete pre-commit workflow (tests/preCommitHook.test.js)
  - [ ] Write E2E test for complete cultivation workflow ⏸️ **NOT IMPLEMENTED**
  - [x] Verify all tests pass
  - [x] Commit: "behavioral: add end-to-end integration tests"
  - **Note**: Pre-commit integration tested; cultivation is manual workflow

### 6.2 Edge Case Testing
- [x] **BEHAVIORAL**: Test edge cases ⚠️ **NEEDS IMPROVEMENT**
  - [ ] Test with very large diffs ⏸️ **NOT IMPLEMENTED**
  - [x] Test with empty repositories (handled in fileReader.js)
  - [x] Test with AI CLI failures (handled in tests) - **BUT over-mocked**
  - [ ] Test with concurrent commits ⏸️ **NOT IMPLEMENTED**
  - [x] Verify all edge cases handled
  - [x] Commit: "behavioral: add edge case handling and tests"
  - **Issues**: 
    - ❌ AI failure tests are over-mocked and don't test real command execution
    - ❌ Need tests with real copilot when available, graceful skip when not

### 6.3 Integration Testing Strategy
- [ ] **NEW**: Establish integration testing patterns
  - [ ] **Philosophy**:
    - Unit tests mock external dependencies (child_process, fs)
    - Integration tests check real command execution when available
    - Tests gracefully skip with clear messages when dependencies missing
    - No false positives from over-mocking
  - [ ] **Implementation**:
    - [ ] Create helper: `isCommandAvailable(command)` - checks if CLI tool installed
    - [ ] Pattern: `test.skipIf(!isCommandAvailable('copilot'), 'message', () => {...})`
    - [ ] Integration tests marked with tag or separate file: `*.integration.test.js`
    - [ ] CI can run `npm test` (unit only) or `npm run test:integration` (both)
  - [ ] **Specific Tests Needed**:
    - [ ] `aiCli.integration.test.js` - real copilot summarization
    - [ ] `aiConsolidation.integration.test.js` - real copilot consolidation
    - [ ] Test shell escaping with special characters in prompts
    - [ ] Test multiline prompt handling
    - [ ] Test model selection flag is passed correctly
  - [ ] Commit: "structural: establish integration testing patterns"

### 6.4 Final Validation
- [ ] Run full test suite (unit tests) - **NEEDS UPDATE after 3.2.2**
- [ ] Run integration test suite - **NEW**
- [ ] Run linter and fix any warnings
- [ ] Test in real repository scenarios with real copilot
- [ ] Verify all documentation is accurate
- [ ] Commit: "behavioral: validate with integration tests"

---

## Future Enhancements (Post-MVP)
- Support additional AI CLIs (Claude, Gemini, Kiro)
- More granular control over instruction file patterns
- Web-based UI for cultivation workflow
- Analytics on memory accumulation and cultivation patterns
- Automated instruction file optimization suggestions
- Multi-language support for prompts

---

## Development Principles Reminder

**TDD Cycle**: Always follow Red → Green → Refactor
1. Write a failing test (Red)
2. Write minimum code to pass (Green)
3. Refactor for clarity (while tests stay Green)

**Testing Strategy**:
- **Unit Tests**: Mock external dependencies (file system, child processes, network)
  - Fast, deterministic, run in CI always
  - Test logic and error handling in isolation
- **Integration Tests**: Use real commands when available, skip gracefully when not
  - Test actual command execution and response parsing
  - Verify shell escaping, argument passing, model selection
  - Tagged separately (e.g., `*.integration.test.js`)
  - Should detect and skip if required CLI tools not installed
- **Avoid Over-Mocking**: If tests pass but code doesn't work, mocks are too permissive
  - Integration tests catch what over-mocked unit tests miss
  - Example: Wrong command `gh copilot` worked in tests but fails in reality

**Commit Discipline**: 
- Commit only when ALL tests pass
- Commit only when ALL linter warnings resolved
- Separate structural commits from behavioral commits
- Use descriptive commit messages with "structural:" or "behavioral:" prefix

**Tidy First**:
- Make structural changes first, behavioral changes after
- Never mix them in the same commit
- Run tests before and after structural changes to ensure no behavior change
