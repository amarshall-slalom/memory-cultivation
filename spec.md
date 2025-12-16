This is a tool in 2 parts:
1. A git pre-commit hook script for programmatic AI-assisted memory aggregration
2. A set of AI prompts/slash commands for cultivating that memory to improve the AI-assisted memory

## Git Pre-Commit Hook Script
### Script FLow
1. The current diff is fetch
2. A one-shot call to the AI cli is made
3. The output is saved to to a file in the .memory directory
### Requirements
* An AI cli (copilot, gemini, kiro, claude)
* A githook installer (like husky or a maven plugin)
### AI CLI prompt
```
Review the attached diff and write a brief summary of the changes, focusing on 2 types of changes: behavioral (new functionality) and structural (refactors, style changes, etc.)
```
### File name scheme
`<commit-hash>-<commit-date>.md`
### Additional Requirements
* Given: the cultivate script has run
  * When: the commit for a cultivate contains only instruction updates and .memory file removals
  * Then: there is no need to create a new memory, so the pre-commit should pass without running

## Memory Cultivation
### Initial Integration
* Copilot
### Design
* Run as slash command
* Read all instruction files
* Read all files in .memory
* Prompt user with consolidated learnings to integrate into insruction files and allow them to choose to add (y/n)
* Review instruction files for out-of-date or incorrect information
* Prompt user to remove unneeded data (y/n)
* Remove all files in .memory to clean up
* Make a commit with these files