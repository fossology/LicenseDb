#!/bin/bash
# SPDX-FileCopyrightText: 2025 fossology community
# SPDX-License-Identifier: GPL-2.0-only

# Script to validate commit messages in a range against conventional commit format
# This is designed for CI/CD validation of pull requests

set -euo pipefail

# Get the range of commits to validate (e.g., from base branch to current branch)
if [ $# -eq 0 ]; then
    # If no arguments provided, validate the last commit
    COMMIT_RANGE="HEAD~1..HEAD"
else
    COMMIT_RANGE="$1"
fi

echo "Validating commits in range: $COMMIT_RANGE"

# Get the list of commit hashes in the range
COMMIT_HASHES=$(git log --format="%H" "$COMMIT_RANGE" --reverse)

# Counter for validation
VALID_COUNT=0
INVALID_COUNT=0

# Define the regex pattern for conventional commits
# Format: <type>(<scope>): <subject>
# Type can be: feat, fix, docs, style, refactor, perf, test, chore
# Also allow merge commits and empty commits (which are typically skipped)
PATTERN="^(feat|fix|docs|style|refactor|perf|test|chore)(\([[:alnum:]_.-]+\))?: .+|Merge |^$"

# Check if there are any commits to validate
if [ -z "$COMMIT_HASHES" ]; then
    echo "No commits found in range: $COMMIT_RANGE"
    exit 0
fi

# Validate each commit
for commit_hash in $COMMIT_HASHES; do
    COMMIT_SUBJECT=$(git log --format=%s -n 1 "$commit_hash")
    
    # Skip merge commits and empty commits
    if [[ $COMMIT_SUBJECT =~ ^Merge\  ]] || [ -z "$COMMIT_SUBJECT" ]; then
        echo "✅ Skipping merge/empty commit: $COMMIT_SUBJECT"
        continue
    fi
    
    # Validate the commit message
    if [[ $COMMIT_SUBJECT =~ $PATTERN ]]; then
        echo "✅ Valid commit: $COMMIT_SUBJECT"
        ((VALID_COUNT++))
    else
        echo "❌ Invalid commit: $COMMIT_SUBJECT"
        echo "Expected format: <type>(<scope>): <subject>"
        echo "Where type is one of: feat, fix, docs, style, refactor, perf, test, chore"
        echo ""
        ((INVALID_COUNT++))
    fi
done

echo ""
echo "Validation Summary:"
echo "  Valid commits: $VALID_COUNT"
echo "  Invalid commits: $INVALID_COUNT"

if [ $INVALID_COUNT -gt 0 ]; then
    echo ""
    echo "❌ Commit validation failed! Please fix the commit messages to follow conventional commit format."
    exit 1
else
    echo "✅ All commits follow conventional commit format!"
    exit 0
fi