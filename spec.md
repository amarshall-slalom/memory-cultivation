This is a tool in 2 parts:
1. A git pre-commit hook script for programmatic AI-assisted memory aggregation
2. A set of AI prompts/slash commands for cultivating that memory to improve the AI-assisted memory

## Git Pre-Commit Hook Script
### Script Flow
1. Check current branch name
   - If on `main` branch: Skip memory generation (no memory for main)
   - If on feature branch: Continue
2. Exclude `.md` files from the diff (plan.md, spec.md, README.md, etc.)
   - Reason: Prevents AI from hallucinating features that are only planned/documented
   - Markdown files will be reviewed separately during cultivation
3. Fetch the filtered diff (staged changes, excluding `.md` files)
4. A one-shot call to the AI CLI is made with a lightweight model (gpt-5-mini)
5. The output is appended to or creates `.memory/<branch-name>.md`
   - First commit on branch: Create new file with header
   - Subsequent commits: Append to existing file with timestamp separator

### Requirements
* An AI cli (copilot, gemini, kiro, claude)
* A git hook installer (like husky or a maven plugin)
* Must NOT run on `main` branch
* Must exclude `.md` files from diff analysis

### AI CLI Prompt
```
Review the attached diff and write a brief summary of the changes, focusing on 2 types of changes: behavioral (new functionality) and structural (refactors, style changes, etc.)
```

### File Naming Scheme
**Branch-based naming**: `.memory/<branch-name>.md`

**Examples**:
- Working on `feature/auth` → `.memory/feature-auth.md`
- Working on `bugfix/login` → `.memory/bugfix-login.md`
- Working on `main` → No memory file created

**File Format** (single file, append mode):
```markdown
# Memory for branch: feature/auth

## Commit 1 - 2024-12-22 14:30:00

### Behavioral Changes
- Added JWT token validation

### Structural Changes
- Refactored auth module

---

## Commit 2 - 2024-12-22 15:45:00

### Behavioral Changes
- Implemented password reset flow

### Structural Changes
- Extracted email service

---
```

**Sanitization**: Branch names are sanitized for filesystem:
- Forward slashes `/` → hyphens `-`
- Special characters removed/replaced
- Example: `feature/add-auth` → `feature-add-auth.md`

### Additional Requirements

**Skip Conditions**:
* Branch is `main` (or `master`) → Skip entirely
* Commit only touches `.memory/` files → Skip (cultivate commit)
* Commit only touches instruction files + `.memory/` → Skip (cultivate commit)
* No staged changes (after excluding `.md` files) → Skip

**Memory File Lifecycle**:
* Created on first commit to a feature branch
* Appended to on each subsequent commit
* Accumulates the entire branch's development story
* Cleaned up during cultivation (user decides to delete or consolidate)

**Markdown File Handling**:
* `.md` files are EXCLUDED from diff sent to AI for memory generation
* `.md` files ARE included in cultivation analysis
  - Cultivation reads all markdown files in repo (spec.md, plan.md, README.md, etc.)
  - AI can suggest updates to documentation based on code changes captured in memories

## Memory Cultivation
### Initial Integration
* Copilot
### Design
* Run as CLI command (`npm run cultivate`)
* Two-phase approach:
  1. **Batch Consolidation Phase** (if >20 memories)
  2. **Final Analysis Phase** (generate instruction suggestions)

### Phase 1: Batch Consolidation (Progressive)

**Goal**: Reduce large sets of memories to manageable consolidated summaries

**Algorithm**: Binary tree batch processing
* If memory count ≤ 20: Skip to Phase 2
* If memory count > 20:
  1. Take oldest N memories (where N ≤ 20)
     - If N still > 20, split in half and repeat
     - Continue until batch ≤ 20
  2. Use AI (gpt-4o or claude-sonnet-4-5) to consolidate batch
  3. Show consolidation to user with options:
     - `y` - Approve: Delete originals, save as `consolidated-{timestamp}.md`
     - `n` - Skip: Keep originals, don't consolidate
     - `edit` - Write own summary: User provides text, save as consolidated
     - `retry` - Regenerate: Call AI again
  4. Repeat until all memories processed or user stops

**Example** (100 memories):
```
100 → split → 50 oldest → split → 25 oldest → split → 13 oldest
13 ≤ 20 → consolidate → user approves → consolidated-001.md
Next 13 → consolidate → consolidated-002.md
...continues...
Result: 8 consolidated files
```

**Consolidated File Format**:
```markdown
# Consolidated Memory
**Original files**: 13
**Date range**: Dec 1-5, 2024
**Consolidated**: Dec 22, 2024

## Behavioral Changes
[AI-generated summary of behavioral changes]

## Structural Changes
[AI-generated summary of structural patterns]

## Technical Decisions
[Key technical decisions captured]
```

### Phase 2: Final Analysis

**Input**: All remaining memory files (≤20 original + any consolidated files)

**Process**:
* Read all instruction files (e.g., `.github/copilot/COPILOT_INSTRUCTIONS.md`)
* Read all remaining memory files
* Use AI (gpt-4o or claude-sonnet-4-5) to analyze and suggest improvements
* Present suggestions to user
* User manually updates instruction files based on suggestions

**AI Prompt**:
```
You are reviewing consolidated memories to improve AI assistant instructions.

Current Instructions:
[instruction file content]

Memories:
[all memory summaries]

Task: Suggest specific, actionable improvements to the instructions. Focus on:
1. Recurring patterns that should be documented
2. New learnings that should be codified  
3. Technical approaches that should be standardized
4. Outdated information that should be removed or updated
```

### Phase 3: Cleanup
* Prompt user to delete processed memory files (y/n)
* Remove all files in .memory (including consolidated files)
* Optionally make a commit with these changes

### Configuration

```json
{
  "ai": {
    "command": "copilot",
    "operations": {
      "summarize": {
        "model": "gpt-5-mini",
        "prompt": "Review the attached diff..."
      },
      "consolidate-batch": {
        "model": "gpt-4o",
        "prompt": "Consolidate multiple memory summaries..."
      },
      "consolidate-final": {
        "model": "gpt-4o", 
        "prompt": "Review consolidated memories for instruction improvements..."
      }
    }
  },
  "cultivation": {
    "batchSize": 20,
    "autoCommit": false,
    "consolidatedFilePrefix": "consolidated-"
  }
}
```

### User Experience

```bash
$ npm run cultivate

=== Memory Cultivation ===

Found 100 memory files

Phase 1: Batch Consolidation
You have more than 20 memories. Let's consolidate them in batches.

Batch 1/8: Consolidating 13 memories (Dec 1-5, 2024)
[Shows AI consolidation]

Options: y (approve) / n (skip) / edit (write own) / retry (regenerate)
Your choice: y
✓ Saved consolidated-1734901234.md, deleted 13 originals

[Repeats for remaining batches...]

Phase 2: Final Analysis
Analyzing 8 consolidated memories...
[Shows instruction improvement suggestions]

Phase 3: Cleanup
Clean up memory files? (y/n): y
[Deletes all memories]
Commit cleanup? (y/n): y
[Commits changes]
```