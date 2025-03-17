# P&ID App Electron - Quick Start Guide

This guide provides simplified instructions for setting up, developing, and building the P&ID App Electron desktop application.

## Prerequisites

- Node.js 18+ 
- pnpm 10.6.3+
- Python 3.9+
- Docker (optional, but recommended for building)

## Quick Setup

We've created helper scripts to make the setup process much easier. To get started:

```bash
# Clone the repository
git clone https://github.com/cronwell-ai/pnidapp
cd pnidapp

# Make the setup script executable
chmod +x scripts/setup-electron-env.sh

# Run the setup script
./scripts/setup-electron-env.sh
```

This script will:
1. Check for required tools
2. Install all dependencies for Next.js, Electron, and companion services
3. Set up the Python virtual environment for the PDF export service
4. Create a template .env.local file

## Development

To start the development environment with a single command:

```bash
# Make the script executable if needed
chmod +x scripts/start-electron-dev.sh

# Start all services and Electron app
./scripts/start-electron-dev.sh
```

This script will:
1. Start the Next.js app
2. Start the metadata parser service
3. Start the PDF export service
4. Wait for all services to be healthy
5. Start the Electron app

All services will be automatically stopped when you close the app or terminate the script.

## Building the App

To build the desktop application package:

```bash
# Make the script executable if needed
chmod +x scripts/build-electron-app.sh

# Run the build script
./scripts/build-electron-app.sh
```

This script will:
1. Ask which platform you want to build for (macOS, Windows, Linux)
2. Start a Docker container to build the application
3. Create packages in the `dist` directory

The built application will be available in the `dist` directory after the build completes.

## Installation & Testing

### macOS

1. Open the `dist` directory
2. Double-click the `.dmg` file
3. Drag the P&ID App to your Applications folder
4. Run the app from your Applications folder

If you see a security warning when first opening the app:
1. Right-click (or Control+click) on the app
2. Choose "Open" from the menu
3. Click "Open" in the dialog that appears

### Windows

1. Open the `dist` directory
2. Double-click the installer `.exe` file
3. Follow the installation prompts
4. Run the app from your Start menu

### Linux

1. Open the `dist` directory
2. Make the `.AppImage` file executable: `chmod +x *.AppImage`
3. Run the AppImage: `./PID-App-x.y.z.AppImage`

## Troubleshooting

If you encounter issues:

1. Check the log files in the `logs` directory
2. Ensure all required ports (3000, 7123, 6123) are available
3. Make sure you've configured the `.env.local` file with valid credentials
4. Refer to the detailed [Electron Troubleshooting Guide](./electron-troubleshooting.md)

## Advanced Usage

For more detailed information, refer to these guides:

- [Electron Setup Guide](./electron-setup.md) - Detailed setup instructions
- [Electron Testing Guide](./electron-testing.md) - Comprehensive testing procedures
- [Electron Building Guide](./electron-build.md) - Advanced building and distribution options
- [Electron Security Guidelines](./electron-security.md) - Security best practices

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/cronwell-ai/pnidapp/issues)
2. Review the detailed documentation in the `docs` directory
3. Create a new issue with details about your problem