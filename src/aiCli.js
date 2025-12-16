const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function summarizeDiff(diff) {
  // Check if diff is empty
  if (!diff || diff.trim().length === 0) {
    return '## Summary\n\nNo changes detected.';
  }

  // Try to use GitHub Copilot CLI for better summaries
  try {
    // Create a temporary file for the diff
    const tmpDir = os.tmpdir();
    const diffFile = path.join(tmpDir, `diff-${Date.now()}.txt`);
    fs.writeFileSync(diffFile, diff);

    const prompt = `Review the attached diff and write a brief summary of the changes, focusing on 2 types of changes: behavioral (new functionality) and structural (refactors, style changes, etc.)

Diff content:
${diff}`;

    const promptFile = path.join(tmpDir, `prompt-${Date.now()}.txt`);
    fs.writeFileSync(promptFile, prompt);

    // Call GitHub Copilot CLI
    const result = execSync(`gh copilot suggest --target shell "$(cat ${promptFile})"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Clean up
    fs.unlinkSync(diffFile);
    fs.unlinkSync(promptFile);

    return `## Summary\n\n${result.trim()}`;
  } catch {
    // Fallback to simple summary if copilot is not available
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
