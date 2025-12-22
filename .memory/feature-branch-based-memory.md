# Memory for branch: feature/branch-based-memory

## Commit 1 - 2025-12-22 17:36:59

## Summary

Behavioral: Docs update the agent pre-coding workflow (PROJECT CONTEXT refs and WORKFLOW.md moved/rewritten) and add an explicit "Create Pull Request" step requiring human approval; runtime now writes branch‑scoped memory files (.memory/<sanitized-branch>.md) using a new appendMemory flow that appends timestamped, numbered "Commit" entries and attempts to auto-stage the file with git add while tolerating git-add failures.  
Structural: Added a .memory summary file, moved WORKFLOW.md into .github/copilot/, exported appendMemory and getBranchFileName from src/memoryStorage.js (with a try/catch around execSync('git add')), updated the pre-commit hook to skip main/master via getBranchFileName and call appendMemory instead of generating a filename/saveMemory, and expanded tests to mock and validate the new branch-sanitization, append behavior, auto-stage invocation, and main-branch skip.

---
