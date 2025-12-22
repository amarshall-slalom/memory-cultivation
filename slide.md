# Memory Cultivation Tool - Slide Deck Specification

## Slide 1: Title
**Memory Cultivation: AI-Assisted Learning from Your Code Changes**

Subtitle: Automatically capture and integrate learnings from your development workflow

---

## Slide 2: The Problem

### Challenge: AI Assistants Don't Learn From Your Work
- Every commit contains valuable context about your codebase
- Behavioral changes (new features) and structural changes (refactors) represent decisions and patterns
- This knowledge is lost after each commit - AI assistants start fresh every time
- Developers manually repeat the same context in prompts
- No systematic way to evolve AI instructions based on actual code evolution

### The Cost
- Reduced AI effectiveness over time
- Repeated explanations of the same concepts
- Missed opportunities for AI to understand project-specific patterns
- Manual maintenance of instruction files becomes stale

---

## Slide 3: The Solution - Overview

### Two-Part System for Continuous AI Learning

**Part 1: Automatic Memory Capture (Pre-Commit Hook)**
- Captures knowledge from every commit automatically
- AI summarizes changes: behavioral vs. structural
- Stores summaries in `.memory/` directory
- Zero manual effort required

**Part 2: Memory Cultivation (CLI Command)**
- Reviews accumulated memories periodically
- AI consolidates learnings into actionable insights
- Interactive workflow for updating instruction files
- Cleans up processed memories

### Result
Evolving AI instructions that grow smarter with your codebase

---

## Slide 4: How It Works - Memory Capture

### Pre-Commit Hook Workflow

```
Developer commits → Hook triggers → Fetch staged diff
                                          ↓
                                    AI summarizes
                                    (behavioral & structural)
                                          ↓
                                    Save to .memory/
                                    {commit-hash}-{date}.md
```

### Key Features
- **Automatic**: Runs on every commit via git hook
- **Smart Detection**: Skips cultivation-only commits (no recursive summaries)
- **Lightweight**: Quick AI summary, doesn't block commits
- **Organized**: Memory files named by commit hash and date

### Example Memory File
```
Commit: abc123f - 2024-01-15

Behavioral:
- Added user authentication with JWT tokens
- Implemented password reset flow

Structural:
- Refactored auth module to separate concerns
- Renamed variables for clarity (userId → userID)
```

---

## Slide 5: How It Works - Memory Cultivation

### Cultivation Command Workflow

```
Developer runs 'cultivate' → Read all .memory/*.md files
                                       ↓
                                 Read instruction files
                              (.github/copilot/*.md)
                                       ↓
                            AI consolidates learnings
                                       ↓
                          Present suggestions to user
                                       ↓
                     User approves/rejects each (y/n)
                                       ↓
                         Update instruction files
                                       ↓
                          Clean up .memory/ files
                                       ↓
                            Optional: Auto-commit
```

### Key Features
- **Consolidation**: AI synthesizes patterns from multiple commits
- **Interactive**: User maintains control over what gets integrated
- **Cleanup**: Removes processed memories to avoid duplication
- **Versioned**: Changes committed to track instruction evolution

---

## Slide 6: System Usage - Setup

### Initial Installation

1. **Install the tool**
   ```bash
   npm install memory-cultivation
   ```

2. **Configure git hooks**
   ```bash
   npm run install-hooks
   # Or using Husky/simple-git-hooks
   ```

3. **Configure AI CLI**
   - Install GitHub Copilot CLI (`copilot`)
   - Or configure alternative: Claude, Gemini, etc.

4. **Optional: Customize configuration**
   ```json
   {
     "ai": {
       "command": "copilot",
       "commandArgs": ["--model", "gpt-5-mini"]
     }
   }
   ```

### That's It!
Pre-commit hook now captures memories automatically

---

## Slide 7: System Usage - Daily Workflow

### Developer Experience

**Normal Development (Automatic)**
```bash
# Make changes
git add .
git commit -m "Add user profile page"
# ✓ Hook automatically creates memory summary
# ✓ Saved to .memory/abc123f-2024-01-15.md
# ✓ Commit proceeds normally
```

**Periodic Cultivation (Manual)**
```bash
# After 5-10 commits, or weekly
npm run cultivate

# Interactive prompts:
# "Add learning: 'Project uses JWT for auth'? (y/n)"
# "Add learning: 'Use userID naming convention'? (y/n)"
# ...

# ✓ Instructions updated
# ✓ Memory files cleaned
# ✓ Changes committed
```

### Zero Disruption
- Pre-commit adds ~1-2 seconds to commit time
- Cultivation done on your schedule
- Fully optional and interruptible

---

## Slide 8: System Usage - Example Evolution

### Before Memory Cultivation
```markdown
# .github/copilot/COPILOT_INSTRUCTIONS.md

You are helping with a web application.
Use TypeScript.
```

### After 20 Commits + Cultivation
```markdown
# .github/copilot/COPILOT_INSTRUCTIONS.md

You are helping with a web application.
Use TypeScript.

## Authentication Patterns
- Use JWT tokens for authentication
- Store tokens in httpOnly cookies
- Password reset requires email confirmation

## Naming Conventions
- User identifiers: use 'userID' not 'userId'
- API endpoints: REST pattern /api/v1/{resource}
- Test files: {module}.test.ts

## Architecture Decisions
- Separated auth module into auth/service and auth/controller
- Database queries in repository layer only
- Error handling uses custom AppError class
```

### Result
AI assistant now understands your project-specific patterns without manual prompting

---

## Slide 9: Benefits & Impact

### For Developers
- **Better AI Assistance**: Context-aware suggestions from day one
- **Zero Manual Work**: Memories captured automatically
- **Controlled Integration**: You decide what gets elevated to instructions
- **Living Documentation**: Instructions evolve with your codebase

### For Teams
- **Shared Knowledge**: Instruction files capture collective decisions
- **Onboarding**: New AI users get project context automatically
- **Pattern Enforcement**: Documented conventions in instruction files
- **Historical Context**: Memory files provide audit trail

### For Projects
- **Reduced Technical Debt**: AI learns your refactoring patterns
- **Consistency**: AI suggestions align with project standards
- **Scalability**: Knowledge capture scales with development
- **Continuous Improvement**: AI gets smarter as project grows

---

## Slide 10: Technical Architecture

### Components

**Pre-Commit Hook** (`hooks/pre-commit`)
- Git diff fetching
- AI CLI integration (configurable)
- File naming & storage
- Cultivate commit detection

**Cultivation Command** (`bin/cultivate.js`)
- File reading (memories + instructions)
- AI consolidation
- Interactive user prompts
- File updates & cleanup
- Git commit creation

**Configuration** (`.memory-cultivation.config.json`)
- AI command customization
- Custom prompt templates
- Operation-specific overrides

### Technology Stack
- Node.js/JavaScript
- GitHub Copilot CLI (or alternatives)
- Git hooks (Husky/simple-git-hooks)
- TDD with Jest

---

## Slide 11: Future Vision

### Current State (MVP)
✓ Automatic memory capture  
✓ Manual cultivation workflow  
✓ GitHub Copilot integration  
✓ Basic configuration  

### Roadmap
- **Multi-AI Support**: Claude, Gemini, Kiro
- **Smart Suggestions**: AI identifies outdated instructions
- **Auto-Cultivation**: Periodic automatic cultivation (optional)
- **Analytics**: Insights on memory patterns and instruction evolution
- **Web UI**: Visual interface for cultivation workflow
- **Team Features**: Shared instruction repositories
- **Integration**: CI/CD pipeline awareness

### Long-term Goal
AI assistants that truly learn and evolve with your codebase, becoming more valuable over time

---

## Slide 12: Call to Action

### Get Started Today

1. **GitHub**: [github.com/your-org/memory-cultivation]
2. **Install**: `npm install memory-cultivation`
3. **Try It**: Make a few commits, run `cultivate`
4. **Contribute**: Open source - PRs welcome!

### Questions?

**Contact**: [your-email@example.com]  
**Docs**: [Full documentation in README.md]  
**License**: MIT

---

### Thank You!

*Let your AI assistant learn from your work, not just assist with it.*
