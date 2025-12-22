# Development Workflow for Memory Cultivation Tool

## Git Branch Workflow

### Overview
This project uses a **feature branch workflow** with pull requests for all changes. Each top-level section of work gets its own branch.

### Workflow Steps for Each Top-Level Section

#### 1. Start on Main Branch
```bash
# Ensure you're on main
git checkout main

# Update from origin (if this fails, notify user)
git pull origin main

# Verify clean working directory
git status
# Should show "nothing to commit, working tree clean"
# If there are uncommitted files, notify user
```

#### 2. Create Feature Branch
```bash
# Create and switch to new branch
# Branch naming: feature/<description> or fix/<description>
git checkout -b feature/branch-based-memory

# Verify branch created
git branch --show-current
# Should show your new branch name
```

#### 3. Do the Work
- Follow TDD cycles from plan.md
- Make small, focused commits
- Use proper commit message format:
  - `behavioral: <description>` for new functionality
  - `structural: <description>` for refactors
  - `chore: <description>` for maintenance tasks

#### 4. Before Push - Pre-Push Checklist
```bash
# 1. Verify all tests pass
npm test

# 2. Verify linting clean
npm run lint

# 3. Check for uncommitted files
git status
# If ANY files are uncommitted (even .memory files), notify user
# Do NOT push until user confirms

# 4. Verify all commits are on the branch
git log --oneline
```

#### 5. Push Branch
```bash
# Push branch to origin
git push origin <branch-name>

# Example:
# git push origin feature/branch-based-memory
```

#### 6. Wait for User
**STOP HERE** - Do not continue to next section

- User will create PR
- User will review and merge to main
- User will notify when merged

**Do NOT**:
- Create the PR yourself
- Merge to main yourself
- Start next section before user confirms merge
- Continue work on the feature branch after push

#### 7. After User Confirms Merge
Only after user says "merged" or "integrated to main":

```bash
# Switch back to main
git checkout main

# Pull the merged changes
git pull origin main

# Delete local feature branch
git branch -d <branch-name>

# Ready to start next section (go back to step 1)
```

## Error Handling

### If `git checkout main` fails:
- **STOP** and notify user
- Do not attempt to fix
- User may need to handle conflicts or stashing

### If `git pull origin main` fails:
- **STOP** and notify user
- May indicate network issues or conflicts
- User needs to resolve

### If uncommitted files exist before push:
- **STOP** and notify user
- List the uncommitted files
- Do not commit them automatically
- User decides what to do

### If tests or linting fail:
- Fix the issues
- Commit the fixes
- Retry the pre-push checklist

## Top-Level Sections Definition

**Top-level sections** are major features or phases from plan.md:

**Examples**:
- Exclude markdown from diff (Cycle 2a)
- Branch-based memory system (Cycles 6a-6d)
- Batch consolidation (Cycles 16-21)
- Cultivation workflow improvements

**Not top-level** (can be grouped):
- Multiple small refactors
- Related test updates
- Documentation fixes that go with a feature

## Current Process Notes

**Initial Setup** (this session):
- Currently on `main` branch
- 6 commits ahead of origin
- Cleaned up orphaned memory files
- All changes committed
- **User will push** - do NOT push this time

**Next Session**:
- Will follow the workflow above
- First section will be "Exclude markdown from diff" (Cycle 2a)
- Create branch: `feature/exclude-markdown-from-diff`

## Memory File Behavior

**Current (commit-based)**:
- Memory files generated on every commit
- Files get committed with the code

**Future (branch-based)**:
- Memory files will NOT be on main branch
- Each feature branch has ONE memory file
- Memory file is `.gitignore`d or cleaned before merge
- Cultivation happens before PR, memories deleted after

## Commands Reference

```bash
# Check current branch
git branch --show-current

# Check status (uncommitted files)
git status

# Check what branch is tracking
git branch -vv

# View recent commits
git log --oneline -5

# List all branches
git branch -a

# Verify clean state before push
git status && echo "---" && git log --oneline -5
```

## Commit Message Format

**Behavioral Changes** (new functionality):
```
behavioral: add markdown exclusion to git diff
behavioral: implement branch-based memory naming
behavioral: add auto-staging of memory files
```

**Structural Changes** (refactors, no new behavior):
```
structural: refactor memory storage module
structural: extract branch name sanitization
structural: improve error messages
```

**Maintenance** (docs, config, cleanup):
```
chore: update workflow documentation
chore: clean up orphaned memory files
chore: update dependencies
```

## TDD Cycle Flow

Each cycle:
1. Write failing test (Red)
2. Implement minimum code (Green)
3. Refactor if needed (Refactor)
4. Commit with appropriate message
5. Continue to next cycle

Multiple cycles can go in one feature branch until the top-level section is complete.
