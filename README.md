# Memory Cultivation

A tool for AI-assisted memory management in Git repositories. This tool helps track changes over time through automated pre-commit summaries and provides a cultivation workflow to integrate learnings into your development process.

## Features

- **Pre-commit Hook**: Automatically generates summaries of changes before each commit
- **Memory Files**: Stores change summaries in `.memory/` directory for later review
- **Cultivation Command**: Interactive tool to review accumulated memories and clean up
- **AI-Powered**: Integrates with GitHub Copilot CLI for intelligent summaries and suggestions
- **TDD-First**: Built following Test-Driven Development principles
- **Cultivate Detection**: Smart detection to skip memory generation for cultivation commits

## Prerequisites

- Node.js (version 14 or higher)
- Git
- **GitHub Copilot CLI** (optional, but recommended for AI-powered features)
  - Install with: `gh extension install github/gh-copilot`
  - Without it, the tool falls back to basic diff statistics

## Installation

```bash
npm install
```

This will install dependencies and set up git hooks automatically.

## Usage

### Pre-commit Hook

The pre-commit hook runs automatically on every commit. It will:

1. Detect if this is a "cultivate" commit (only instruction/memory file changes) and skip if so
2. Fetch the staged git diff
3. Generate an AI-powered summary of the changes using GitHub Copilot CLI (or basic stats if not available)
4. Save the summary to `.memory/<commit-hash>-<date>.md`

The hook runs silently and won't block your commits unless there's an error.

### Cultivation Command

Run the cultivation command to review and clean up accumulated memories:

```bash
npm run cultivate
```

This will:
1. Display all accumulated memory files
2. Show current instruction files (e.g., `.github/copilot/COPILOT_INSTRUCTIONS.md`)
3. **Generate AI-powered consolidation suggestions** using GitHub Copilot CLI
4. Provide actionable suggestions for improving your workflow
5. Offer to clean up memory files
6. Optionally commit the cleanup

## Project Structure

```
.
├── .memory/              # Generated memory summaries
├── bin/                  # Executable scripts
│   └── cultivate.js     # Cultivation command
├── hooks/               # Git hook implementations
│   └── pre-commit.js    # Pre-commit hook logic
├── src/                 # Source code modules
│   ├── aiCli.js        # AI CLI integration (GitHub Copilot)
│   ├── aiConsolidation.js  # AI-powered memory consolidation
│   ├── cultivateDetector.js  # Detect cultivate commits
│   ├── fileReader.js   # Read memory and instruction files
│   ├── gitDiff.js      # Fetch git diffs
│   └── memoryStorage.js # Save memory files
├── tests/              # Test files (Jest)
└── .husky/             # Husky git hooks
```

## Development

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Linting

```bash
npm run lint          # Check code quality
npm run lint:fix      # Auto-fix linting issues
```

### Development Principles

This project follows:
- **TDD (Test-Driven Development)**: Red → Green → Refactor cycle
- **Tidy First**: Structural changes separated from behavioral changes
- **Commit Discipline**: Only commit when all tests pass and linters are clean

## Configuration

The tool is configured via `.memory-cultivation.config.json`:

```json
{
  "aiProvider": "copilot",
  "instructionFiles": [
    ".github/copilot/COPILOT_INSTRUCTIONS.md"
  ],
  "memoryDirectory": ".memory",
  "prompts": {
    "summarize": "Review the attached diff and write a brief summary..."
  },
  "cultivation": {
    "autoCommit": false,
    "commitMessage": "chore: clean up memory files after cultivation"
  }
}
```

### AI Provider

Currently supports **GitHub Copilot CLI** as the AI provider. The tool gracefully falls back to basic diff statistics if Copilot is not available.

Future versions will support:
- Multiple AI CLI providers (Claude, Gemini, etc.)
- Custom prompt templates
- Configurable instruction file patterns

## How It Works

### Memory Generation Flow

1. You make changes and stage them (`git add`)
2. You commit (`git commit`)
3. Pre-commit hook triggers
4. Hook checks if this is a cultivate commit
5. If not, generates diff summary
6. Saves summary to `.memory/<hash>-<date>.md`
7. Commit proceeds normally

### Cultivation Flow

1. Run `npm run cultivate`
2. Review accumulated memories
3. **AI analyzes memories and suggests instruction improvements**
4. Review AI-generated consolidation suggestions
5. Manually update instruction files based on insights
6. Choose to clean up memory files
7. Optionally commit the cleanup

## Contributing

See the [plan.md](plan.md) for the detailed implementation roadmap and development phases.

## License

ISC
