const aiCommandBuilder = require('./aiCommandBuilder');
const configReader = require('./configReader');

async function generateConsolidationSuggestions(memories, instructions) {
  // Handle edge cases
  if (!memories || memories.length === 0) {
    return 'No memories to consolidate.';
  }

  // Build the prompt for the AI
  const memoriesText = memories.map((m, idx) => `### Memory ${idx + 1}\n${m}`).join('\n\n');
  const instructionsText = instructions || '(No existing instructions)';
  
  const config = configReader.loadConfig();
  const basePrompt = aiCommandBuilder.getPrompt(config, 'consolidate');
  
  const fullPrompt = `${basePrompt}

**Current Instructions:**
${instructionsText}

**Accumulated Memories:**
${memoriesText}`;

  try {
    const result = aiCommandBuilder.executeAICommand(config, 'consolidate', fullPrompt);
    return result.trim();
  } catch (error) {
    // If AI fails, return a helpful message
    return `Unable to generate AI suggestions (AI command failed: ${error.message}).

Please manually review the ${memories.length} memory file(s) and consider:
1. Adding recurring patterns to your instructions
2. Documenting new learnings
3. Updating technical approaches based on changes made`;
  }
}

module.exports = {
  generateConsolidationSuggestions
};
