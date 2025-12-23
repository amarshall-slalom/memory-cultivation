# Memory for branch: feature/git-workflow-script

## Commit 1 - 2025-12-23 09:05:14

## Summary

Behavioral: Adds a new executable git-workflow.sh script (bin/git-workflow.sh) that automates staging, committing (requires -m), pushing the current branch, and optionally creating a GitHub PR via the gh CLI (supports --title and --body); it runs sequentially and exits on any error (set -e), emitting user-friendly status messages.  

Structural: This is purely an addition of a new Bash utility file (no modifications to existing sources), with simple arg parsing and procedural flow—a small structural enhancement that does not refactor existing code.

---
