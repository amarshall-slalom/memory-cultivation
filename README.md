# Memory Cultivation

A tool for AI-assisted memory management in Git repositories. This tool helps track changes over time through automated pre-commit summaries and provides a cultivation workflow to integrate learnings into your development process.

## Features

- **Pre-commit Hook**: Automatically generates summaries of changes before each commit
- **Memory Files**: Stores change summaries in `.memory/` directory for later review
- **Cultivation Command**: Interactive tool to review accumulated memories and clean up
- **TDD-First**: Built following Test-Driven Development principles
- **Cultivate Detection**: Smart detection to skip memory generation for cultivation commits

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
3. Generate a summary of the changes
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
3. Provide suggestions for improving your workflow
4. Offer to clean up memory files
5. Optionally commit the cleanup

## Project Structure

```
.
├── .memory/              # Generated memory summaries
├── bin/                  # Executable scripts
│   └── cultivate.js     # Cultivation command
├── hooks/               # Git hook implementations
│   └── pre-commit.js    # Pre-commit hook logic
├── src/                 # Source code modules
│   ├── aiCli.js        # AI CLI integration (placeholder)
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

Currently uses a simple placeholder for AI summaries. Future versions will support:
- Multiple AI CLI providers (GitHub Copilot, Claude, Gemini, etc.)
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
3. Manually update instruction files based on insights
4. Choose to clean up memory files
5. Optionally commit the cleanup

## Contributing

See the [plan.md](plan.md) for the detailed implementation roadmap and development phases.

## License

ISC
