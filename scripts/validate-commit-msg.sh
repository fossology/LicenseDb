#!/bin/bash
# SPDX-FileCopyrightText: 2025 fossology community
# SPDX-License-Identifier: GPL-2.0-only

# Script to validate commit messages against conventional commit format
# Format: <type>(<scope>): <subject>
# Where type is one of: feat, fix, docs, style, refactor, perf, test, chore

set -euo pipefail

# Get the commit message from the argument (or from .git/COMMIT_EDITMSG)
COMMIT_MSG_FILE="${1:-.git/COMMIT_EDITMSG}"
COMMIT_MESSAGE=$(cat "$COMMIT_MSG_FILE")

# Remove comments and empty lines from commit message
CLEAN_COMMIT_MESSAGE=$(echo "$COMMIT_MESSAGE" | sed '/^#/d' | sed '/^$/d' | head -n 1)

# If commit message is empty after cleaning, skip validation (merge commits, etc.)
if [ -z "$CLEAN_COMMIT_MESSAGE" ]; then
    exit 0
fi

# Define the regex pattern for conventional commits
# Format: <type>(<scope>): <subject>
# Type can be: feat, fix, docs, style, refactor, perf, test, chore
# Scope is optional
PATTERN="^(feat|fix|docs|style|refactor|perf|test|chore)(\([[:alnum:]_.-]+\))?: .+"

# Validate the commit message
if [[ ! $CLEAN_COMMIT_MESSAGE =~ $PATTERN ]]; then
    echo "❌ Commit message does not follow conventional commit format!"
    echo ""
    echo "Expected format: <type>(<scope>): <subject>"
    echo "Where type is one of: feat, fix, docs, style, refactor, perf, test, chore"
    echo ""
    echo "Examples:"
    echo "  feat(auth): add login functionality"
    echo "  fix(api): resolve null pointer exception"
    echo "  docs(readme): update installation instructions"
    echo "  refactor(utils): improve code structure"
    echo ""
    echo "Your commit message: $CLEAN_COMMIT_MESSAGE"
    exit 1
else
    echo "✅ Commit message follows conventional commit format: $CLEAN_COMMIT_MESSAGE"
fi