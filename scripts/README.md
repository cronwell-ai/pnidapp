# P&ID App Helper Scripts

This directory contains helper scripts to simplify the process of setting up, developing, and building the P&ID App.

## Available Scripts

- **setup-electron-env.sh** - One-time setup for all dependencies required for Electron development
- **start-electron-dev.sh** - Starts all services and Electron in development mode
- **build-electron-app.sh** - Builds the Electron app for distribution

## Usage

First, make the scripts executable:

```bash
chmod +x scripts/*.sh
```

Then run the scripts from the project root:

```bash
# Setup
./scripts/setup-electron-env.sh

# Development
./scripts/start-electron-dev.sh

# Building
./scripts/build-electron-app.sh
```

## Script Details

### setup-electron-env.sh

This script:
- Checks for required dependencies (Node.js, pnpm, Python)
- Installs project dependencies
- Sets up the Python virtual environment for the PDF export service
- Creates a template `.env.local` file if it doesn't exist

### start-electron-dev.sh

This script:
- Starts the Next.js app on port 3000
- Starts the metadata parser service on port 7123
- Starts the PDF export service on port 6123
- Verifies the health of all services
- Starts the Electron app in development mode
- Automatically stops all services when the script is terminated

### build-electron-app.sh

This script:
- Uses Docker to create a consistent build environment
- Builds the Next.js application
- Builds the Electron application
- Packages the application for macOS, Windows, or Linux (user's choice)
- Places the built packages in the `dist` directory

## Logs

The scripts create a `logs` directory with individual log files for each service:
- `logs/nextjs.log`
- `logs/metadata-parser.log`
- `logs/pdf-export.log`

Check these logs for troubleshooting service-specific issues.