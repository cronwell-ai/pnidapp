# Electron Setup Guide

This guide explains how to set up and build the P&ID App as an Electron desktop application.

> **Note:** For a simplified setup process with helper scripts, check the [Electron Quick Start Guide](./electron-quick-start.md).

## Prerequisites

- Node.js 18+ installed
- pnpm installed (v10.6.3 or newer)
- Python 3.9+ installed (for the PDF Export service)
- Git

## Development Workflow

### Setting Up the Development Environment

1. Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd pnidapp
pnpm install
```

2. Install Electron dependencies:

```bash
cd electron
pnpm install
cd ..
```

3. Create a `.env.local` file in the root with your Supabase and OpenAI credentials:

```
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# OpenAI API key for metadata parsing
OPENAI_API_KEY=your_openai_api_key

# Other settings
NEXT_PUBLIC_EXTERNAL_IP=localhost
```

4. Start the development environment:

```bash
# Terminal 1 - Start the Next.js development server
pnpm dev

# Terminal 2 - Start the metadata parser
cd companion/metadata-parser
pnpm dev

# Terminal 3 - Start the PDF export service
cd companion/pdf-export
python3 -m venv venv  # First time only
source venv/bin/activate
pip install -r requirements.txt  # First time only
python main.py

# Terminal 4 - Start Electron in development mode
cd electron
pnpm dev
```

### Running in Development Mode

The `pnpm dev` command in the electron directory runs both the Next.js development server and the Electron app in development mode. This loads the Next.js app from the development server but wraps it in Electron.

## Building for Production

### Building the macOS Application

1. Build the Next.js application:

```bash
pnpm build
```

2. Build the Electron application:

```bash
cd electron
pnpm build
```

The macOS application will be created in the `electron/dist` directory.

3. For macOS notarization (required for distribution):

```bash
cd electron
pnpm pack:mac
```

This will create a .dmg file that can be distributed.

### Building for Other Platforms

- Windows: `cd electron && pnpm pack:win`
- Linux: `cd electron && pnpm pack:linux`

## Architecture Overview

The Electron app consists of three main components:

1. **Main Process (main.js)**: Controls application lifecycle, native menus, and system integration.
2. **Preload Script (preload.js)**: Safely exposes Electron APIs to the renderer process.
3. **Renderer Process (Next.js app)**: The UI loaded in a BrowserWindow.

### Communication Flow

- **IPC Communication**: The main process and renderer process communicate via IPC (Inter-Process Communication).
- **Contextual Detection**: The app detects whether it's running in Electron or web environment and adapts accordingly.

### Companion Services

The desktop app bundles and manages:

1. **Metadata Parser**: Node.js microservice for processing P&ID images.
2. **PDF Export**: Python microservice for generating annotated PDFs.

These are launched as child processes when the Electron app starts.

## macOS Specifics

### Notarization

For distribution on macOS, the app needs to be notarized by Apple:

```bash
# After building
xcrun notarytool submit ./electron/dist/P&ID\ App-0.1.0.dmg --apple-id your_apple_id --password your_app-specific_password --team-id your_team_id
```

### Sandboxing

The app uses macOS sandboxing for security. The entitlements are defined in `electron/build/entitlements.mac.plist`.

## Transitioning Between Desktop and Web

The application is designed to work seamlessly in both desktop and web environments:

- All Electron-specific code is isolated in the `src/lib/electron` directory.
- Feature detection is used to determine the environment and adapt accordingly.
- The `useElectron()` hook provides access to desktop-specific features only when available.
- Fallback web implementations are provided for all desktop-specific features.

This architecture ensures that the codebase can be maintained as a single source of truth for both platforms.