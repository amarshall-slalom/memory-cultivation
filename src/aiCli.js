function summarizeDiff(diff) {
  // For now, create a simple summary
  // This will be replaced with actual AI CLI integration based on configuration
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

**Note**: This is a placeholder summary. Configure an AI CLI for detailed analysis.
`;
}

module.exports = {
  summarizeDiff
};
