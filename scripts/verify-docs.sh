#!/bin/bash
set -e

# Print a nice banner
echo "
📚 P&ID APP - DOCUMENTATION VERIFICATION
=========================================
This script checks documentation for accuracy and broken links
"

# Check if npm is installed for markdown-link-check
if ! command -v npm &> /dev/null; then
  echo "❌ npm is needed for link checking. Please install Node.js."
  exit 1
fi

# Install link checker if needed
if ! command -v markdown-link-check &> /dev/null; then
  echo "📦 Installing markdown-link-check..."
  npm install -g markdown-link-check
fi

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check a single file for broken links
check_file() {
  local file=$1
  echo -e "${YELLOW}Checking $file...${NC}"
  
  # Run link check
  broken_links=$(markdown-link-check "$file" -q | grep -c "ERROR")
  
  if [ "$broken_links" -eq 0 ]; then
    echo -e "${GREEN}✓ No broken links in $file${NC}"
    return 0
  else
    echo -e "${RED}✗ Found $broken_links broken links in $file${NC}"
    markdown-link-check "$file" | grep "ERROR" -A 1
    return 1
  fi
}

# Find all documentation files
echo "🔍 Finding documentation files..."
docs_files=$(find ./docs -name "*.md")
root_files=$(find . -maxdepth 1 -name "*.md")
all_files="$root_files $docs_files"

# Check script permissions
echo "🔍 Checking script permissions..."
scripts=$(find ./scripts -name "*.sh")
for script in $scripts; do
  if [ ! -x "$script" ]; then
    echo -e "${YELLOW}⚠️ Script $script is not executable. Fixing...${NC}"
    chmod +x "$script"
  else
    echo -e "${GREEN}✓ Script $script is executable${NC}"
  fi
done

# Check all documentation files
echo "🔍 Checking all documentation files for broken links..."
has_errors=0

for file in $all_files; do
  if ! check_file "$file"; then
    has_errors=1
  fi
done

# Check electron documentation consistency
echo "🔍 Checking for Electron documentation consistency..."
if ! grep -q "Desktop Application" ./README.md; then
  echo -e "${RED}✗ README.md is missing Desktop Application section${NC}"
  has_errors=1
fi

if ! grep -q "electron" ./CLAUDE.md; then
  echo -e "${RED}✗ CLAUDE.md is missing Electron instructions${NC}"
  has_errors=1
fi

# Report results
if [ $has_errors -eq 0 ]; then
  echo -e "\n${GREEN}✅ All documentation checks passed!${NC}"
  exit 0
else
  echo -e "\n${RED}❌ Some documentation checks failed. Please fix the issues above.${NC}"
  exit 1
fi