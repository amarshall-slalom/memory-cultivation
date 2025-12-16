# Implementation Plan for Memory Cultivation Tool

## Overview
This project consists of two main components:
1. A git pre-commit hook script for AI-assisted memory aggregation
2. A set of AI prompts/slash commands for cultivating and improving the AI-assisted memory

**Development Methodology**: Following TDD (Test-Driven Development) and Tidy First principles:
- Red → Green → Refactor cycle for all features
- Separate structural changes (refactors, renames) from behavioral changes (new functionality)
- Never mix structural and behavioral changes in the same commit
- Commit only when ALL tests pass and ALL linter warnings are resolved

---

## Phase 1: Project Setup & Infrastructure

### 1.1 Initialize Project Structure
- [ ] **STRUCTURAL**: Create initial directory structure
  - [ ] Create `.memory/` directory (gitignored initially, will contain generated summaries)
  - [ ] Create `hooks/` directory for git hook scripts
  - [ ] Create `src/` or `lib/` directory for main code
  - [ ] Create `test/` or `tests/` directory for test files
  - [ ] Commit: "structural: initialize project directory structure"

### 1.2 Configure Testing Framework
- [ ] **STRUCTURAL**: Set up testing infrastructure
  - [ ] Choose testing framework (Jest, Mocha, or language-appropriate framework)
  - [ ] Install test framework dependencies
  - [ ] Create initial test configuration file
  - [ ] Add test script to package.json/build file
  - [ ] Verify test runner works with a simple smoke test
  - [ ] Commit: "structural: configure testing framework"

### 1.3 Configure Linting & Code Quality
- [ ] **STRUCTURAL**: Set up code quality tools
  - [ ] Install ESLint/Prettier or language-appropriate linter
  - [ ] Create linter configuration file
  - [ ] Add linting script to package.json/build file
  - [ ] Run linter on existing code and fix any issues
  - [ ] Commit: "structural: configure linting and code quality tools"

### 1.4 Git Hook Infrastructure Setup
- [ ] **STRUCTURAL**: Set up hook management system
  - [ ] Choose hook installer (Husky, simple-git-hooks, or manual)
  - [ ] Install and configure hook installer
  - [ ] Create pre-commit hook entry point
  - [ ] Verify hooks are triggered on commit
  - [ ] Commit: "structural: set up git hook infrastructure"

---

## Phase 2: Pre-Commit Hook - Core Functionality (TDD)

### 2.1 Git Diff Fetching Module
- [ ] **BEHAVIORAL** (TDD Cycle 1): Test fetching staged diff
  - [ ] Write failing test: `shouldFetchStagedDiffWhenFilesAreStaged`
  - [ ] Implement minimum code to pass test
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: add ability to fetch staged git diff"

- [ ] **BEHAVIORAL** (TDD Cycle 2): Handle empty diff
  - [ ] Write failing test: `shouldReturnEmptyStringWhenNoDiffExists`
  - [ ] Implement minimum code to pass test
  - [ ] Verify all tests pass
  - [ ] Commit: "behavioral: handle empty git diff gracefully"

- [ ] **STRUCTURAL**: Refactor if needed
  - [ ] Extract duplicated code if any
  - [ ] Improve naming for clarity
  - [ ] Verify tests still pass
  - [ ] Commit: "structural: refactor git diff module for clarity"

### 2.2 AI CLI Integration Module
- [ ] **BEHAVIORAL** (TDD Cycle 3): Test AI CLI execution
  - [ ] Write failing test: `shouldCallAICliWithDiffAndPrompt`
  - [ ] Implement minimum code to call AI CLI (mock/stub for testing)
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: add AI CLI invocation capability"

- [ ] **BEHAVIORAL** (TDD Cycle 4): Handle AI CLI errors
  - [ ] Write failing test: `shouldThrowErrorWhenAICliFailsToExecute`
  - [ ] Implement error handling
  - [ ] Verify all tests pass
  - [ ] Commit: "behavioral: handle AI CLI execution errors"

- [ ] **BEHAVIORAL** (TDD Cycle 5): Test response parsing
  - [ ] Write failing test: `shouldParseAICliResponseCorrectly`
  - [ ] Implement response parsing
  - [ ] Verify all tests pass
  - [ ] Commit: "behavioral: parse AI CLI response output"

- [ ] **STRUCTURAL**: Refactor AI module
  - [ ] Extract AI CLI interface for flexibility
  - [ ] Improve error messages
  - [ ] Verify tests still pass
  - [ ] Commit: "structural: extract AI CLI interface"

### 2.3 File Naming & Storage Module
- [ ] **BEHAVIORAL** (TDD Cycle 6): Test commit hash retrieval
  - [ ] Write failing test: `shouldGenerateFileNameWithCommitHashAndDate`
  - [ ] Implement file naming function (use current/staged commit info)
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: generate memory file names with commit hash and date"

- [ ] **BEHAVIORAL** (TDD Cycle 7): Test file saving
  - [ ] Write failing test: `shouldSaveAIOutputToMemoryDirectory`
  - [ ] Implement file writing to `.memory/` directory
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: save AI summaries to .memory directory"

- [ ] **BEHAVIORAL** (TDD Cycle 8): Handle file system errors
  - [ ] Write failing test: `shouldHandleFileSystemErrorsGracefully`
  - [ ] Implement error handling for file operations
  - [ ] Verify all tests pass
  - [ ] Commit: "behavioral: handle file system errors in memory storage"

### 2.4 Cultivate Commit Detection
- [ ] **BEHAVIORAL** (TDD Cycle 9): Detect cultivate commits
  - [ ] Write failing test: `shouldDetectCommitWithOnlyInstructionAndMemoryChanges`
  - [ ] Implement logic to check staged files
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: detect cultivate-only commits"

- [ ] **BEHAVIORAL** (TDD Cycle 10): Skip hook for cultivate commits
  - [ ] Write failing test: `shouldSkipHookWhenCultivateCommitDetected`
  - [ ] Implement early exit for cultivate commits
  - [ ] Verify all tests pass
  - [ ] Commit: "behavioral: skip memory generation for cultivate commits"

### 2.5 Pre-Commit Hook Integration
- [ ] **BEHAVIORAL** (TDD Cycle 11): Wire all modules together
  - [ ] Write integration test: `shouldExecuteFullPreCommitWorkflow`
  - [ ] Connect all modules in hook script
  - [ ] Verify integration test passes
  - [ ] Commit: "behavioral: integrate all modules in pre-commit hook"

- [ ] **STRUCTURAL**: Refactor hook script
  - [ ] Extract functions for single responsibility
  - [ ] Add helpful logging/debugging output
  - [ ] Verify tests still pass
  - [ ] Commit: "structural: refactor pre-commit hook for clarity"

---

## Phase 3: Memory Cultivation Command (TDD)

### 3.1 File Reading Module
- [ ] **BEHAVIORAL** (TDD Cycle 12): Read memory files
  - [ ] Write failing test: `shouldReadAllFilesFromMemoryDirectory`
  - [ ] Implement function to read all `.memory/*.md` files
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: read all memory files from .memory directory"

- [ ] **BEHAVIORAL** (TDD Cycle 13): Read instruction files
  - [ ] Write failing test: `shouldReadAllInstructionFiles`
  - [ ] Implement function to read instruction files (e.g., `.github/copilot/COPILOT_INSTRUCTIONS.md`)
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: read instruction files for cultivation"

- [ ] **BEHAVIORAL** (TDD Cycle 14): Handle missing directories
  - [ ] Write failing test: `shouldHandleMissingMemoryDirectoryGracefully`
  - [ ] Implement error handling for missing directories
  - [ ] Verify all tests pass
  - [ ] Commit: "behavioral: handle missing directories in file reading"

### 3.2 AI Consolidation Module
- [ ] **BEHAVIORAL** (TDD Cycle 15): Generate consolidation suggestions
  - [ ] Write failing test: `shouldGenerateConsolidatedLearningSuggestions`
  - [ ] Implement AI call to consolidate memories into suggested instruction updates
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: generate consolidated learning suggestions from memories"

- [ ] **BEHAVIORAL** (TDD Cycle 16): Identify outdated information
  - [ ] Write failing test: `shouldIdentifyOutdatedInstructionContent`
  - [ ] Implement AI call to identify outdated/incorrect information in instructions
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: identify outdated instruction content"

- [ ] **STRUCTURAL**: Refactor AI consolidation
  - [ ] Extract shared AI prompting logic
  - [ ] Improve prompt templates
  - [ ] Verify tests still pass
  - [ ] Commit: "structural: refactor AI consolidation module"

### 3.3 User Interaction Module
- [ ] **BEHAVIORAL** (TDD Cycle 17): Prompt for integration approval
  - [ ] Write failing test: `shouldPromptUserForEachSuggestionWithYesNoOption`
  - [ ] Implement interactive prompt for suggestions
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: prompt user to approve learning integrations"

- [ ] **BEHAVIORAL** (TDD Cycle 18): Prompt for removal approval
  - [ ] Write failing test: `shouldPromptUserToRemoveOutdatedContent`
  - [ ] Implement interactive prompt for removals
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: prompt user to approve content removals"

- [ ] **STRUCTURAL**: Refactor user interaction
  - [ ] Extract prompt logic into reusable function
  - [ ] Improve user-facing messages
  - [ ] Verify tests still pass
  - [ ] Commit: "structural: extract reusable prompt interaction logic"

### 3.4 File Update & Cleanup Module
- [ ] **BEHAVIORAL** (TDD Cycle 19): Update instruction files
  - [ ] Write failing test: `shouldUpdateInstructionFilesWithApprovedSuggestions`
  - [ ] Implement file update logic based on user approvals
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: update instruction files with approved suggestions"

- [ ] **BEHAVIORAL** (TDD Cycle 20): Remove memory files
  - [ ] Write failing test: `shouldRemoveAllFilesFromMemoryDirectory`
  - [ ] Implement cleanup of `.memory/` directory
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: clean up memory directory after cultivation"

- [ ] **BEHAVIORAL** (TDD Cycle 21): Create cultivate commit
  - [ ] Write failing test: `shouldCommitInstructionUpdatesAndMemoryCleanup`
  - [ ] Implement git commit logic for cultivation changes
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: create git commit for cultivation changes"

### 3.5 Command Integration
- [ ] **BEHAVIORAL** (TDD Cycle 22): Wire cultivation workflow
  - [ ] Write integration test: `shouldExecuteFullCultivationWorkflow`
  - [ ] Connect all cultivation modules
  - [ ] Verify integration test passes
  - [ ] Commit: "behavioral: integrate full memory cultivation workflow"

- [ ] **STRUCTURAL**: Refactor cultivation command
  - [ ] Break into smaller, focused functions
  - [ ] Add progress indicators
  - [ ] Verify tests still pass
  - [ ] Commit: "structural: refactor cultivation command for maintainability"

---

## Phase 4: Configuration & Flexibility

### 4.1 Configuration File Support
- [ ] **BEHAVIORAL** (TDD Cycle 23): Read configuration file
  - [ ] Write failing test: `shouldReadConfigurationFromFile`
  - [ ] Implement config file reading (JSON/YAML)
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: read configuration from file"

- [ ] **BEHAVIORAL** (TDD Cycle 24): Support AI CLI selection
  - [ ] Write failing test: `shouldUseConfiguredAICliProvider`
  - [ ] Implement configurable AI CLI selection
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: support configurable AI CLI provider"

- [ ] **BEHAVIORAL** (TDD Cycle 25): Support custom prompts
  - [ ] Write failing test: `shouldUseCustomPromptTemplatesFromConfig`
  - [ ] Implement custom prompt template support
  - [ ] Verify test passes
  - [ ] Commit: "behavioral: support custom AI prompt templates"

### 4.2 Default Configuration
- [ ] **STRUCTURAL**: Create default config file
  - [ ] Create `.memory-cultivation.config.json` with defaults
  - [ ] Document configuration options
  - [ ] Commit: "structural: add default configuration file"

---

## Phase 5: Documentation & Polish

### 5.1 User Documentation
- [ ] **STRUCTURAL**: Create comprehensive README
  - [ ] Document installation steps
  - [ ] Document usage for pre-commit hook
  - [ ] Document usage for cultivation command
  - [ ] Add configuration examples
  - [ ] Add troubleshooting section
  - [ ] Commit: "structural: create comprehensive user documentation"

### 5.2 Developer Documentation
- [ ] **STRUCTURAL**: Add developer docs
  - [ ] Document architecture and design decisions
  - [ ] Add contributing guidelines
  - [ ] Document testing approach
  - [ ] Commit: "structural: add developer documentation"

### 5.3 Examples & Templates
- [ ] **STRUCTURAL**: Add examples
  - [ ] Create example memory files
  - [ ] Create example instruction files
  - [ ] Create example configuration files
  - [ ] Commit: "structural: add example files and templates"

---

## Phase 6: Final Testing & Validation

### 6.1 End-to-End Testing
- [ ] **BEHAVIORAL**: Add E2E tests
  - [ ] Write E2E test for complete pre-commit workflow
  - [ ] Write E2E test for complete cultivation workflow
  - [ ] Verify all tests pass
  - [ ] Commit: "behavioral: add end-to-end integration tests"

### 6.2 Edge Case Testing
- [ ] **BEHAVIORAL**: Test edge cases
  - [ ] Test with very large diffs
  - [ ] Test with empty repositories
  - [ ] Test with AI CLI failures
  - [ ] Test with concurrent commits
  - [ ] Verify all edge cases handled
  - [ ] Commit: "behavioral: add edge case handling and tests"

### 6.3 Final Validation
- [ ] Run full test suite
- [ ] Run linter and fix any warnings
- [ ] Test in real repository scenarios
- [ ] Verify all documentation is accurate

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

**Commit Discipline**: 
- Commit only when ALL tests pass
- Commit only when ALL linter warnings resolved
- Separate structural commits from behavioral commits
- Use descriptive commit messages with "structural:" or "behavioral:" prefix

**Tidy First**:
- Make structural changes first, behavioral changes after
- Never mix them in the same commit
- Run tests before and after structural changes to ensure no behavior change
