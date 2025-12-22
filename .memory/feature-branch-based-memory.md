# Memory for branch: feature/branch-based-memory

## Commit 1 - 2025-12-22 17:36:59

## Summary

Behavioral: Docs update the agent pre-coding workflow (PROJECT CONTEXT refs and WORKFLOW.md moved/rewritten) and add an explicit "Create Pull Request" step requiring human approval; runtime now writes branch‑scoped memory files (.memory/<sanitized-branch>.md) using a new appendMemory flow that appends timestamped, numbered "Commit" entries and attempts to auto-stage the file with git add while tolerating git-add failures.  
Structural: Added a .memory summary file, moved WORKFLOW.md into .github/copilot/, exported appendMemory and getBranchFileName from src/memoryStorage.js (with a try/catch around execSync('git add')), updated the pre-commit hook to skip main/master via getBranchFileName and call appendMemory instead of generating a filename/saveMemory, and expanded tests to mock and validate the new branch-sanitization, append behavior, auto-stage invocation, and main-branch skip.

---

## Commit 2 - 2025-12-22 17:47:13

## Summary

Behavioral: getStagedDiff now runs git diff with an exclusion for Markdown files ("git diff --cached -- . ':(exclude)*.md'"), so staged .md changes are omitted; tests were updated and new tests added to assert the exclusion and that non-.md diffs remain.  
Structural: existing test expectation was changed to match the new command and a new "TDD Cycle 2a: Exclude markdown files from diff" describe block with two tests was added; also the command string quoting/style was standardized in code and tests.

---
