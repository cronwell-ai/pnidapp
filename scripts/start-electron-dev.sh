#!/bin/bash
set -e

# Print a nice banner
echo "
🚀 P&ID APP - ELECTRON DEV LAUNCHER
====================================
This script will start all required services and the Electron app
"

# Function to check if a port is free
port_is_free() {
  ! nc -z localhost $1 > /dev/null 2>&1
}

# Check if required ports are available
if ! port_is_free 3000; then
  echo "❌ ERROR: Port 3000 is already in use. Next.js can't start."
  exit 1
fi

if ! port_is_free 7123; then
  echo "❌ ERROR: Port 7123 is already in use. Metadata parser can't start."
  exit 1
fi

if ! port_is_free 6123; then
  echo "❌ ERROR: Port 6123 is already in use. PDF Export service can't start."
  exit 1
fi

# Create a trap to kill all background processes when this script exits
PIDS=()
cleanup() {
  echo -e "\n🛑 Stopping all services..."
  for pid in "${PIDS[@]}"; do
    if ps -p $pid > /dev/null; then
      kill $pid 2>/dev/null || true
    fi
  done
  wait
  echo "✅ All services stopped"
}
trap cleanup EXIT INT TERM

# Function to start a service
start_service() {
  local name=$1
  local command=$2
  local log_file="logs/$name.log"
  
  echo "🔄 Starting $name..."
  mkdir -p logs
  
  # Start the service and capture PID
  eval "$command" > "$log_file" 2>&1 &
  local pid=$!
  PIDS+=($pid)
  
  echo "🔄 $name started with PID $pid (logs in $log_file)"
  return 0
}

# Install dependencies if needed
check_and_install() {
  if [ ! -d "node_modules" ]; then
    echo "📦 Installing main dependencies..."
    pnpm install
  fi
  
  if [ ! -d "companion/metadata-parser/node_modules" ]; then
    echo "📦 Installing metadata parser dependencies..."
    (cd companion/metadata-parser && pnpm install)
  fi
  
  if [ ! -d "electron/node_modules" ]; then
    echo "📦 Installing Electron dependencies..."
    (cd electron && pnpm install)
  fi
  
  # Check for Python virtual environment
  if [ ! -d "companion/pdf-export/venv" ]; then
    echo "📦 Setting up PDF export Python environment..."
    (cd companion/pdf-export && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt)
  fi
}

# Make sure we have all dependencies installed
check_and_install

# Start Next.js
start_service "nextjs" "pnpm dev"

# Start metadata parser
start_service "metadata-parser" "cd companion/metadata-parser && PORT=7123 pnpm dev"

# Start PDF export
start_service "pdf-export" "cd companion/pdf-export && source venv/bin/activate && python main.py"

# Wait a bit for services to come up
echo -e "\n⏳ Waiting for services to start up..."
sleep 8

# Start checking service health
check_health() {
  local name=$1
  local url=$2
  local max_attempts=$3
  local attempt=1
  
  echo "🔍 Checking $name health..."
  
  while [ $attempt -le $max_attempts ]; do
    if curl -s "$url" > /dev/null 2>&1; then
      echo "✅ $name is healthy!"
      return 0
    fi
    
    echo "⏳ $name not ready yet (attempt $attempt/$max_attempts)..."
    sleep 2
    attempt=$((attempt + 1))
  done
  
  echo "❌ $name health check failed after $max_attempts attempts"
  echo "❓ Check logs/nextjs.log for details"
  return 1
}

# Health checks
check_health "Next.js" "http://localhost:3000" 10
check_health "Metadata Parser" "http://localhost:7123/health" 5
check_health "PDF Export" "http://localhost:6123/health" 5

# Start Electron
echo -e "\n🚀 Starting Electron..."
cd electron && pnpm dev

# The cleanup function will be called automatically when this script exits