#!/bin/bash
# Version Manager for Migration Orchestration
# Automatically detects next version number and creates versioned output directory

set -e

PROJECT_NAME="${1:-biblioteca}"  # Default to "biblioteca" if not provided
BASE_DIR="$(pwd)"

# Find all existing versioned directories
EXISTING_VERSIONS=$(find "$BASE_DIR" -maxdepth 1 -type d -name "${PROJECT_NAME}-v*" 2>/dev/null | sed "s/.*${PROJECT_NAME}-v//" | sort -n)

# Determine next version number
if [ -z "$EXISTING_VERSIONS" ]; then
  NEXT_VERSION=1
else
  LAST_VERSION=$(echo "$EXISTING_VERSIONS" | tail -1)
  NEXT_VERSION=$((LAST_VERSION + 1))
fi

# Create new versioned directory name
VERSIONED_DIR="${PROJECT_NAME}-v${NEXT_VERSION}"

echo "🔖 Migration Version Manager"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Project: $PROJECT_NAME"
echo "📁 Output Directory: $VERSIONED_DIR"
echo "🔢 Version: v$NEXT_VERSION"

# Check if directory already exists (shouldn't happen, but safety check)
if [ -d "$VERSIONED_DIR" ]; then
  echo "⚠️  Warning: $VERSIONED_DIR already exists!"
  echo "🔄 Incrementing to avoid collision..."
  NEXT_VERSION=$((NEXT_VERSION + 1))
  VERSIONED_DIR="${PROJECT_NAME}-v${NEXT_VERSION}"
  echo "📁 New Output Directory: $VERSIONED_DIR"
fi

# Create the versioned directory structure
mkdir -p "$VERSIONED_DIR"/{modern-app/apps/{frontend,backend},analysis,results}

echo "✅ Created directory structure:"
echo "   $VERSIONED_DIR/"
echo "   ├── modern-app/"
echo "   │   └── apps/"
echo "   │       ├── frontend/"
echo "   │       └── backend/"
echo "   ├── analysis/"
echo "   └── results/"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Export the versioned directory path for the workflow to use
echo "$VERSIONED_DIR"
