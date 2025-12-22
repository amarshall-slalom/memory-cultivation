const aiCommandBuilder = require('./aiCommandBuilder');
const configReader = require('./configReader');

function summarizeDiff(diff) {
  // Check if diff is empty
  if (!diff || diff.trim().length === 0) {
    return '## Summary\n\nNo changes detected.';
  }

  // Try to use configured AI CLI
  try {
    const config = configReader.loadConfig();
    const prompt = aiCommandBuilder.getPrompt(config, 'summarize');
    const fullPrompt = `${prompt}

Diff content:
${diff}`;

    const result = aiCommandBuilder.executeAICommand(config, 'summarize', fullPrompt);

    return `## Summary\n\n${result.trim()}`;
  } catch {
    // Fallback to simple summary if AI CLI is not available
    const lines = diff.split('\n');
    const addedLines = lines.filter(l => l.startsWith('+')).length;
    const removedLines = lines.filter(l => l.startsWith('-')).length;
    const files = new Set();
    
    lines.forEach(line => {
      if (line.startsWith('diff --git')) {
        const match = line.match(/b\/(.*)/);
        if (match) files.add(match[1]);
      }
    });
    
    return `## Summary
  
**Files Changed**: ${files.size}
**Lines Added**: ${addedLines}
**Lines Removed**: ${removedLines}

**Files**:
${Array.from(files).map(f => `- ${f}`).join('\n')}

**Note**: This is a placeholder summary. Install GitHub Copilot CLI (\`gh copilot\`) for AI-powered analysis.
`;
  }
}

module.exports = {
  summarizeDiff
};
