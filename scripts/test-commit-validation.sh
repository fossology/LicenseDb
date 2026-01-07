#!/bin/bash
# SPDX-FileCopyrightText: 2025 fossology community
# SPDX-License-Identifier: GPL-2.0-only

# Test script to demonstrate commit validation functionality

echo "Testing commit validation script..."

# Create temporary files for testing
VALID_COMMIT="feat(auth): add login functionality"
INVALID_COMMIT="bad commit message format"

echo "Testing valid commit: $VALID_COMMIT"
echo "$VALID_COMMIT" > /tmp/valid_commit.txt
chmod +x scripts/validate-commit-msg.sh
if scripts/validate-commit-msg.sh /tmp/valid_commit.txt; then
    echo "✅ Valid commit correctly validated"
else
    echo "❌ Valid commit incorrectly failed validation"
fi

echo ""
echo "Testing invalid commit: $INVALID_COMMIT"
echo "$INVALID_COMMIT" > /tmp/invalid_commit.txt
if scripts/validate-commit-msg.sh /tmp/invalid_commit.txt; then
    echo "❌ Invalid commit incorrectly passed validation"
else
    echo "✅ Invalid commit correctly failed validation"
fi

# Clean up
rm -f /tmp/valid_commit.txt /tmp/invalid_commit.txt

echo ""
echo "Testing completed!"