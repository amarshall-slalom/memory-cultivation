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
- [x] **CHORE** (Cycle 15.5): Speed up unit tests by mocking AI calls ✅ **COMPLETED**
  - [x] Added jest.mock('../src/aiCommandBuilder') to aiConsolidation.test.js
  - [x] Mock executeAICommand to return fake AI responses (3 tests updated)
  - [x] Added jest.mock('../src/aiCommandBuilder') to aiCli.test.js
  - [x] Mock executeAICommand to return fake summaries (2 tests updated)
  - [x] Verified aiCommandBuilder.integration.test.js still calls real AI
  - [x] All 54 tests passing
  - [x] Test time: 56s → 43.5s (22% faster)
  - [x] Linter clean
  - [x] Commit: "chore: mock AI calls in unit tests for faster execution" (ef56f6c)

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
        "model": "gpt-5",      // More powerful for batch consolidation
        "prompt": "You are consolidating multiple memory summaries from commits. Synthesize these memories into a single coherent summary that captures: 1) Key behavioral changes, 2) Important structural patterns, 3) Technical decisions made. Be concise but preserve important details."
      },
      "consolidate-final": {
        "model": "gpt-5",      // Most powerful for instruction suggestions
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

**Note**: Model selection preference: "gpt-5" or "claude-sonnet-4-5" (user configurable)

- [x] **BEHAVIORAL** (TDD Cycle 16): Batch splitting logic ✅ **COMPLETED**
  - [x] Create `src/batchConsolidator.js` module
  - [x] Write failing test: `shouldReturnSingleBatchWhenUnderLimit`
  - [x] Write failing test: `shouldSplitInHalfWhenOverLimit`
  - [x] Write failing test: `shouldRecursivelySplitLargeSets`
  - [x] Implement `getBatches(memoryFiles, batchSize)` function
    - Returns single batch if files ≤ batchSize
    - Splits into batches of max batchSize
    - Returns array of batch objects with files and batchNumber
  - [x] All 59 tests pass
  - [x] Commit: "behavioral: add batch splitting logic for memory consolidation" (acceb98)

#### 3.2.4 Development Workflow Automation
- [x] **CHORE** (Cycle 16.5): Create sequential git workflow script ✅ **COMPLETED**
  - [x] Created `bin/git-workflow.sh` with sequential execution
  - [x] Script takes `-m "message"`, `--title`, `--body` parameters
  - [x] Executes in strict order: add → commit → push → PR create
  - [x] Made executable and tested both modes
  - [x] Updated COPILOT_INSTRUCTIONS.md with usage guidance
  - [x] Commit: "chore: add sequential git workflow script to prevent race conditions" (c3ed023)

- [x] **BEHAVIORAL** (TDD Cycle 17): Batch consolidation with AI ✅ **COMPLETED**
  - [x] Write failing tests for batch consolidation
  - [x] Mock aiCommandBuilder and fs modules
  - [x] Implement `consolidateBatch(batchFiles, config)` function
    - Reads all memory files in batch
    - Builds consolidation prompt with memories
    - Calls AI with 'consolidate-batch' operation  
    - Returns consolidated text
    - Handles file read and AI errors gracefully
  - [x] All 63 tests passing (9 in batchConsolidator)
  - [x] Commit: "behavioral: add AI batch consolidation capability" (b213de3)

- [x] **BEHAVIORAL** (TDD Cycle 18): Save consolidated memories ✅ **COMPLETED**
  - [x] Write failing test: `shouldSaveConsolidatedMemoryWithTimestamp`
    - Verify file saved to .memory/ directory
    - Verify naming: consolidated-{timestamp}.md
    - Verify content includes metadata (original file count, date range)
  - [x] Write failing test: `shouldIncludeMetadataInConsolidatedFile`
    - Verify header includes: number of memories, date range, consolidation timestamp
  - [x] Implement `saveConsolidatedMemory(content, originalFiles, timestamp)` function
    - Generate filename with timestamp
    - Add metadata header
    - Write to .memory/ directory
    - Return filename
  - [x] Verify tests pass
  - [x] Commit: "behavioral: save consolidated memory files with metadata" (59a8928)

- [x] **BEHAVIORAL** (TDD Cycle 19): Interactive batch approval workflow ✅ **COMPLETED**
  - [x] Write failing test: `shouldPromptUserForBatchApproval`
    - Mock readline interface
    - Verify consolidation shown to user
    - Verify approval prompt appears
  - [x] Write failing test: `shouldHandleUserApproval`
    - User types 'y': Delete originals, save consolidated
    - User types 'n': Skip batch, keep originals
  - [x] Write failing test: `shouldAllowUserToWriteOwnSummary`
    - User types 'edit': Prompt for custom summary
    - Save custom summary as consolidated file
    - Delete originals
  - [x] Write failing test: `shouldHandleUserRetry`
    - User types 'retry': Re-run AI consolidation
    - Show new result
  - [x] Implement interactive approval in `batchConsolidator.js`
    - Function: `promptForApproval(consolidatedText, batchInfo)`
    - Options: 'y' (approve), 'n' (skip), 'edit' (write own), 'retry' (regenerate)
    - Return: {approved: boolean, customText: string|null, action: 'approve'|'skip'|'retry'}
  - [x] Verify tests pass
  - [x] Commit: "behavioral: add interactive batch approval workflow" (bc1f2b6)

- [x] **BEHAVIORAL** (TDD Cycle 20): Integrate batch consolidation into cultivate command ✅ **COMPLETED**
  - [x] Write integration test: `shouldRunBatchConsolidationBeforeFinal`
    - Set up scenario with 50 memory files
    - Verify batches created
    - Verify user prompted for each batch
    - Verify consolidated files created
    - Verify original files deleted (when approved)
  - [x] Update `bin/cultivate.js`:
    - [x] Add batch consolidation phase before final consolidation
    - [x] Check memory count at start
    - [x] If > batchSize: Run batch consolidation loop
      - Get batches from batchConsolidator
      - For each batch:
        - Show batch info (e.g., "Batch 1/8: consolidating 13 memories from Dec 1-5")
        - Call consolidateBatch()
        - Show result to user
        - Prompt for approval
        - Handle user response (approve/skip/edit/retry)
        - If approved: save consolidated, delete originals
    - [x] Continue to existing final consolidation with remaining files
  - [x] Verify integration test passes
  - [ ] Manual testing with real memory files
  - [x] Commit: "behavioral: integrate batch consolidation into cultivate workflow"

- [x] **STRUCTURAL** (TDD Cycle 21): Refactor and polish batch consolidation ✅ **COMPLETED**
  - [x] Extract common prompt building logic
  - [x] Add progress indicators (e.g., "Processing batch 3/8...")
  - [x] Improve error messages
  - [ ] Add dry-run mode (show what would happen without executing) ⏸️ **DEFERRED**
  - [x] Verify all tests still pass
  - [x] Run linter and fix issues
  - [x] Commit: "structural: refactor batch consolidation for clarity"

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
- [x] **BEHAVIORAL** (Cycles 17, 19): Interactive prompts ✅ **MVP IMPLEMENTED**
  - [x] Prompt for cleanup approval (Cycle 17)
  - [x] Prompt for batch approval (Cycle 19)
  - **Note**: Implemented in cultivation command (bin/cultivate.js) for cleanup workflow

- [ ] **BEHAVIORAL** (Future): Interactive instruction file updates ⏸️ **DEFERRED**
  - [ ] Write failing test: `shouldPromptUserForEachSuggestionWithApplyOption`
  - [ ] Implement interactive prompt for each AI suggestion
  - [ ] Allow preview before applying
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: add interactive instruction file updates"
  - **Note**: Currently manual - user copies suggestions themselves

- [ ] **STRUCTURAL** (Future): Refactor user interaction ⏸️ **DEFERRED**
  - [ ] Extract prompt logic into reusable function
  - [ ] Improve user-facing messages
  - [ ] Verify tests still pass
  - [ ] Commit: "structural: extract reusable prompt interaction logic"

### 3.4 File Update & Cleanup Module
- [x] **BEHAVIORAL** (Cycle 20): Remove memory files ✅ **COMPLETED**
  - [x] Implemented in bin/cultivate.js (manual cleanup workflow)
  - [x] Interactive prompt for cleanup
  - [x] Optional git commit

- [ ] **BEHAVIORAL** (Future): Automatic instruction file updates ⏸️ **DEFERRED**
  - [ ] Write failing test: `shouldUpdateInstructionFilesWithApprovedSuggestions`
  - [ ] Implement file update logic based on user approvals
  - [ ] Support preview and rollback
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: update instruction files with approved suggestions"
  - **Note**: Would require interactive editing workflow

### 3.5 Command Integration
- [x] **BEHAVIORAL** (Cycles 20, 21, 22): Full cultivation workflow ✅ **COMPLETED**
  - [x] Cycle 20: Integrate batch consolidation into cultivate
  - [x] Cycle 21: Refactor for clarity
  - [x] Cycle 22 (implicit): Working end-to-end workflow
  - [x] All tests passing, linter clean
  - **Note**: Working cultivation command in bin/cultivate.js

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

### 6.1 User Documentation
- [x] **STRUCTURAL**: Create comprehensive README ✅ **COMPLETED**
  - [x] Document installation steps
  - [x] Document usage for pre-commit hook
  - [x] Document usage for cultivation command
  - [x] Add configuration examples
  - [x] Add troubleshooting section
  - [x] Commit: "structural: create comprehensive user documentation"

### 6.2 Developer Documentation
- [x] **STRUCTURAL**: Add developer docs ✅ **COMPLETED**
  - [x] Document architecture and design decisions
  - [x] Add contributing guidelines
  - [x] Document testing approach
  - [x] Commit: "structural: add developer documentation"
  - **Note**: IMPLEMENTATION_SUMMARY.md provides detailed developer documentation

### 6.3 Examples & Templates
- [x] **STRUCTURAL**: Add examples ✅ **PARTIALLY COMPLETED**
  - [x] Create example memory files (generated automatically through usage)
  - [x] Create example instruction files (uses existing .github/copilot/COPILOT_INSTRUCTIONS.md)
  - [x] Create example configuration files (.memory-cultivation.config.json)
  - [x] Commit: "structural: add example files and templates"

---

## Phase 7: Memory Regeneration Tool

### 7.1 Manual Memory Recovery
When memories are missed (e.g., PR merged without hook running, manual commits to main), users need a way to retroactively generate memories.

- [ ] **BEHAVIORAL** (TDD Cycle): Generate memory from commit hash
  - [ ] Write failing test: `shouldGenerateMemoryFromCommitHash`
    - Test with commit hash on main branch
    - Verify diff extracted correctly
    - Verify AI summarization called
    - Verify memory saved to user-specified filename
  - [ ] Write failing test: `shouldExcludeMarkdownFilesFromCommitDiff`
    - Verify MD files filtered out per existing rules
    - Verify only code changes included in diff
  - [ ] Write failing test: `shouldRequireUserToSpecifyFilename`
    - Test that filename parameter is required
    - Test that filename is saved to .memory/ directory
    - Test that filename validation (no path traversal)
  - [ ] Implement `npm run remember -- --commit <hash> --name <filename>`
    - Get commit diff from git (main branch only)
    - Filter out MD files and non-code changes
    - Call AI summarization (reuse existing logic)
    - Save to `.memory/<filename>.md`
    - Validate filename (alphanumeric, hyphens, underscores only)
  - [ ] Write failing test: `shouldSupportPRNumberLookup`
    - User provides `--pr <number>` instead of commit hash
    - Lookup merge commit for that PR
    - Generate memory from merge commit
  - [ ] Implement PR number support
    - Use `gh pr view <number> --json mergeCommit`
    - Extract commit hash
    - Proceed with commit-based flow
  - [ ] Verify all tests pass
  - [ ] Commit: "behavioral: add memory regeneration tool for missed commits"

- [ ] **STRUCTURAL**: Add usage documentation
  - [ ] Update README with memory regeneration examples
  - [ ] Add error messages for invalid inputs
  - [ ] Document use cases (manual commits, missed PRs, etc)
  - [ ] Commit: "structural: document memory regeneration feature"

**Use Cases:**
- PR merged but hook didn't run
- Manual commits pushed directly to main
- Want to create memory for specific historical commit
- Migrating to memory-cultivation tool (backfill old commits)

**Example Usage:**
```bash
# Generate from commit hash
npm run remember -- --commit abc123 --name fix-auth-bug

# Generate from PR number
npm run remember -- --pr 42 --name feature-user-profiles

# Result: Creates .memory/fix-auth-bug.md with AI summary
```

---

## Phase 8: Final Testing & Validation

### 8.1 End-to-End Testing
- [x] **BEHAVIORAL**: Add E2E tests ✅ **PARTIALLY COMPLETED**
  - [x] Write E2E test for complete pre-commit workflow (tests/preCommitHook.test.js)
  - [x] Write integration tests for batch consolidation (tests/cultivate.integration.test.js)
  - [x] Verify all tests pass
  - [x] Commit: "behavioral: add end-to-end integration tests"
  - **Note**: 81 tests passing

### 8.2 Edge Case Testing
- [x] **BEHAVIORAL**: Test edge cases ⚠️ **NEEDS IMPROVEMENT**
  - [ ] Test with very large diffs ⏸️ **NOT IMPLEMENTED**
  - [x] Test with empty repositories (handled in fileReader.js)
  - [x] Test with AI CLI failures (handled in tests)
  - [ ] Test with concurrent commits ⏸️ **NOT IMPLEMENTED**
  - [x] Verify all edge cases handled
  - [x] Commit: "behavioral: add edge case handling and tests"

### 8.3 Integration Testing Strategy
- [x] **STRUCTURAL**: Establish integration testing patterns ✅ **COMPLETED** (Cycle 15b)
  - [x] Created aiCommandBuilder.integration.test.js
  - [x] Tests detect if copilot command is available
  - [x] Tests skip gracefully when dependencies missing
  - [x] Tests verify real command execution
  - **Note**: Pattern established and working

### 8.4 Final Validation
- [x] Run full test suite (81 tests passing)
- [x] Run linter (clean)
- [ ] Test in real repository scenarios with real copilot ⏸️ **MANUAL**
- [x] Verify all documentation is accurate
- [ ] Test npm package installation ⏸️ **WAITING ON PHASE 4**

---

## Future Enhancements (Post-MVP)
- Support additional AI CLIs (Claude, Gemini, Kiro)
- More granular control over instruction file patterns
- Web-based UI for cultivation workflow
- Analytics on memory accumulation and cultivation patterns
- Automated instruction file optimization suggestions (interactive file editing)
- Multi-language support for prompts
- Batch memory regeneration (multiple commits at once)

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
