#!/bin/bash
set -e

# Print a nice banner
echo "
🔨 P&ID APP - ELECTRON BUILDER
==============================
This script will build the Electron app for macOS
"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "❌ ERROR: Docker is not installed. Please install Docker first."
  echo "📝 Visit https://docs.docker.com/get-docker/ for installation instructions."
  exit 1
fi

# Ask which platform to build for
echo "Which platform do you want to build for?"
echo "1) macOS (default)"
echo "2) Windows"
echo "3) Linux"
echo "4) All platforms"
read -p "Enter your choice (1-4): " platform_choice

# Set default if empty
platform_choice=${platform_choice:-1}

# Set the build command based on choice
case $platform_choice in
  1)
    build_command="pnpm pack:mac"
    platform_name="macOS"
    ;;
  2)
    build_command="pnpm pack:win"
    platform_name="Windows"
    ;;
  3)
    build_command="pnpm pack:linux"
    platform_name="Linux"
    ;;
  4)
    build_command="pnpm pack:mac && pnpm pack:win && pnpm pack:linux"
    platform_name="all platforms"
    ;;
  *)
    echo "❌ Invalid choice. Defaulting to macOS."
    build_command="pnpm pack:mac"
    platform_name="macOS"
    ;;
esac

echo "🔄 Building for $platform_name..."

# Create directory for the build output
mkdir -p dist

# Run the build using Docker Compose
echo "🔄 Starting Docker build environment..."
docker compose -f docker-compose.electron.yml up --build

# Update the build command in the docker-compose file
sed -i.bak "s|pnpm build|pnpm build|g" docker-compose.electron.yml
sed -i.bak "s|pnpm build|$build_command|g" docker-compose.electron.yml

if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully!"
  echo "📦 Your packaged application can be found in the ./dist directory"
else
  echo "❌ Build failed. Please check the logs above for errors."
  exit 1
fi