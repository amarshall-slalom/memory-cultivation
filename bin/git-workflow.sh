#!/bin/bash

# Git Workflow Script - Sequential execution to prevent race conditions
# Usage:
#   ./bin/git-workflow.sh -m "commit message"
#   ./bin/git-workflow.sh -m "commit message" --title "PR title" --body "PR body"

set -e  # Exit on any error

# Parse arguments
COMMIT_MESSAGE=""
PR_TITLE=""
PR_BODY=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -m)
      COMMIT_MESSAGE="$2"
      shift 2
      ;;
    --title)
      PR_TITLE="$2"
      shift 2
      ;;
    --body)
      PR_BODY="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 -m \"commit message\" [--title \"PR title\"] [--body \"PR body\"]"
      exit 1
      ;;
  esac
done

# Validate required arguments
if [ -z "$COMMIT_MESSAGE" ]; then
  echo "Error: Commit message is required (-m)"
  echo "Usage: $0 -m \"commit message\" [--title \"PR title\"] [--body \"PR body\"]"
  exit 1
fi

# Get current branch
BRANCH=$(git branch --show-current)
echo "📍 Current branch: $BRANCH"

# Prevent commits to main
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  echo "❌ ERROR: Cannot commit directly to $BRANCH branch"
  echo "Please create a feature branch first:"
  echo "  git checkout -b feature/description-of-work"
  exit 1
fi

# Step 1: Stage all changes
echo "📦 Staging changes..."
git add -A

# Step 2: Commit
echo "💾 Committing: $COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE"

# Step 3: Push
echo "🚀 Pushing to origin/$BRANCH..."
git push origin "$BRANCH"

# Step 4: Create PR if title provided
if [ -n "$PR_TITLE" ]; then
  echo "🔀 Creating pull request..."
  if [ -n "$PR_BODY" ]; then
    gh pr create --title "$PR_TITLE" --body "$PR_BODY" --base main --head "$BRANCH"
  else
    gh pr create --title "$PR_TITLE" --base main --head "$BRANCH"
  fi
  echo "✅ Pull request created!"
else
  echo "✅ Changes committed and pushed (no PR created)"
fi

echo ""
echo "✨ Workflow complete!"
