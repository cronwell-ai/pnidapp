#!/bin/bash
set -e

# Print a nice banner
echo "
🛠️  P&ID APP - ELECTRON ENVIRONMENT SETUP
==========================================
This script will set up all dependencies needed for Electron development
"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for required tools and install if missing
check_requirement() {
  local cmd=$1
  local install_instructions=$2
  
  echo -n "🔍 Checking for $cmd... "
  
  if command_exists "$cmd"; then
    echo "✅ Found!"
  else
    echo "❌ Not found!"
    echo "📝 $install_instructions"
    return 1
  fi
  
  return 0
}

# Make sure we're in the project root
if [ ! -f "package.json" ]; then
  echo "❌ ERROR: This script must be run from the project root directory."
  exit 1
fi

# Check for Node.js
check_requirement "node" "Please install Node.js from https://nodejs.org/en/download/"

# Check for pnpm
check_requirement "pnpm" "Install pnpm with npm install -g pnpm"

# Check for Python
check_requirement "python3" "Please install Python 3 from https://www.python.org/downloads/"

# Check for Docker (optional)
check_requirement "docker" "Docker is recommended but optional. Visit https://docs.docker.com/get-docker/ to install." || echo "⚠️  Docker not found but will continue anyway"

# Create directories if needed
mkdir -p logs
mkdir -p dist

# Install main project dependencies
echo "📦 Installing main project dependencies..."
pnpm install

# Install Electron dependencies
echo "📦 Installing Electron dependencies..."
(cd electron && pnpm install)

# Install metadata parser dependencies
echo "📦 Installing metadata parser dependencies..."
(cd companion/metadata-parser && pnpm install)

# Set up Python virtual environment for PDF export
echo "📦 Setting up PDF export Python environment..."
(cd companion/pdf-export && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt)

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
  echo "📝 Creating .env.local file (you'll need to fill in the values)..."
  cat > .env.local << EOF
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# OpenAI API key for metadata parsing
OPENAI_API_KEY=

# For email functionality (can be dummy value for local dev)
RESEND_API_KEY=test_key

# For local development with companion services
NEXT_PUBLIC_EXTERNAL_IP=localhost
EOF
fi

# Make scripts executable
chmod +x scripts/*.sh

echo -e "\n✅ Setup complete! You can now run the P&ID App Electron development environment."
echo "📝 Next steps:"
echo "   1. Update .env.local with your API keys and Supabase credentials"
echo "   2. Run './scripts/start-electron-dev.sh' to start the development environment"
echo "   3. Run './scripts/build-electron-app.sh' when ready to build the packaged application"