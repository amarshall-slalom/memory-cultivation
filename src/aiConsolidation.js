const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function generateConsolidationSuggestions(memories, instructions) {
  // Handle edge cases
  if (!memories || memories.length === 0) {
    return 'No memories to consolidate.';
  }

  // Build the prompt for the AI
  const memoriesText = memories.map((m, idx) => `### Memory ${idx + 1}\n${m}`).join('\n\n');
  const instructionsText = instructions || '(No existing instructions)';
  
  const prompt = `You are reviewing accumulated memories from code commits to help improve AI assistant instructions.

**Current Instructions:**
${instructionsText}

**Accumulated Memories:**
${memoriesText}

**Task:**
Review the memories and suggest specific additions or improvements to the instructions. Focus on:
1. Patterns or practices that appear repeatedly
2. New learnings that should be codified
3. Specific technical approaches that should be documented

Provide actionable suggestions that can be integrated into the instructions.`;

  try {
    // Create a temporary file for the prompt
    const tmpDir = os.tmpdir();
    const promptFile = path.join(tmpDir, `consolidation-prompt-${Date.now()}.txt`);
    fs.writeFileSync(promptFile, prompt);

    // Call GitHub Copilot CLI
    const result = execSync(`gh copilot suggest --target shell "$(cat ${promptFile})"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Clean up
    fs.unlinkSync(promptFile);

    return result.trim();
  } catch {
    // If copilot fails, return a helpful message
    return `Unable to generate AI suggestions (copilot not available or failed).

Please manually review the ${memories.length} memory file(s) and consider:
1. Adding recurring patterns to your instructions
2. Documenting new learnings
3. Updating technical approaches based on changes made`;
  }
}

module.exports = {
  generateConsolidationSuggestions
};
