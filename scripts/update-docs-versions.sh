#!/bin/bash
set -e

# Print a nice banner
echo "
🔄 P&ID APP - DOCUMENTATION VERSION UPDATE
=========================================
This script updates version references in documentation
"

# Get the current version
if [ -f "package.json" ]; then
  version=$(grep -o '"version": "[^"]*' package.json | cut -d'"' -f4)
  echo "📊 Detected version: $version"
else
  echo "❌ package.json not found. Please run from project root."
  exit 1
fi

# Update version references in docs
echo "🔄 Updating version references in docs..."

# Function to update version numbers in file
update_versions() {
  local file=$1
  echo "Processing $file..."
  
  # Create a backup
  cp "$file" "$file.bak"
  
  # Replace version patterns
  sed -i '' -E "s/v[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+\.[0-9]+)?/v$version/g" "$file"
  
  # Count changes
  diff_count=$(diff -u "$file.bak" "$file" | grep -c '^+' || true)
  if [ "$diff_count" -gt 0 ]; then
    echo "✅ Updated $diff_count version references in $file"
  else
    echo "ℹ️ No version references updated in $file"
  fi
  
  # Remove backup
  rm "$file.bak"
}

# Update version in documentation files
find ./docs -name "*.md" -exec bash -c "update_versions {}" \;

# Update main README
update_versions "./README.md"

# Update CLAUDE.md
update_versions "./CLAUDE.md"

# Add an optional commit message
echo "✅ Version references updated to v$version"
echo "ℹ️ You may want to commit these changes with:"
echo "git add -u && git commit -m \"docs: update version references to v$version\""