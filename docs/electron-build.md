# Building the P&ID App Electron Application

This guide provides detailed instructions for building and packaging the P&ID App Electron application for distribution.

## Prerequisites

- Node.js 18+ installed
- pnpm 10.6.3+ installed
- Python 3.9+ installed with pip
- For macOS builds: macOS with Xcode command line tools installed
- For Windows builds: Windows with Visual Studio Build Tools
- For code signing: Valid Apple Developer ID (macOS) or Microsoft Authenticode certificate (Windows)

## Development Environment Setup

Before building, ensure your development environment is properly set up:

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

3. Set up companion services:

```bash
# Metadata parser
cd companion/metadata-parser
pnpm install

# PDF export service
cd ../pdf-export
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

4. Create a `.env.local` file with required credentials:

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

## Building for Production

### Step 1: Build the Next.js Application

First, build the Next.js application:

```bash
pnpm build
```

This creates an optimized production build in the `.next` directory.

### Step 2: Build the Electron Application

#### For macOS:

```bash
cd electron
pnpm pack:mac
```

This will create a `.dmg` file in the `electron/dist` directory.

#### For Windows:

```bash
cd electron
pnpm pack:win
```

This will create a `.exe` installer in the `electron/dist` directory.

#### For Linux:

```bash
cd electron
pnpm pack:linux
```

This will create an `.AppImage` file in the `electron/dist` directory.

## Code Signing

### macOS Code Signing and Notarization

For distribution on macOS, your app should be signed and notarized:

1. Obtain an Apple Developer ID certificate from the Apple Developer Portal.

2. Configure your build with signing identity:

```json
// In electron/package.json
"build": {
  "mac": {
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist",
    "identity": "Developer ID Application: Your Name (YOUR_TEAM_ID)"
  }
}
```

3. Build the signed package:

```bash
cd electron
pnpm pack:mac
```

4. Notarize the app:

```bash
xcrun notarytool submit ./dist/P&ID\ App-0.1.0.dmg \
  --apple-id your_apple_id@example.com \
  --password your_app_specific_password \
  --team-id YOUR_TEAM_ID \
  --wait
```

### Windows Code Signing

1. Obtain a code signing certificate.

2. Configure your build with signing identity:

```json
// In electron/package.json
"build": {
  "win": {
    "certificateFile": "path/to/certificate.pfx",
    "certificatePassword": "YOUR_CERTIFICATE_PASSWORD"
  }
}
```

3. Build the signed package:

```bash
cd electron
pnpm pack:win
```

## Advanced Configuration

### Customizing Build Settings

The build configuration is defined in `electron/package.json`. Common customizations include:

- **Application icon**: Replace `build/icon.icns` (macOS), `build/icon.ico` (Windows)
- **File associations**: Add to the `fileAssociations` field
- **Application metadata**: Update `productName`, `appId`, etc.

### Optimizing Build Size

To reduce the final package size:

1. Configure files to exclude:

```json
"build": {
  "files": [
    "main.js",
    "preload.js",
    "package.json"
  ],
  "extraResources": [
    {
      "from": "../companion",
      "to": "companion",
      "filter": ["**/*", "!**/node_modules/**", "!**/.venv/**", "!**/__pycache__/**"]
    }
  ]
}
```

2. Use production dependencies only:

```bash
cd electron
pnpm prune --production
```

3. Enable compression:

```json
"build": {
  "compression": "maximum"
}
```

## Troubleshooting Common Build Issues

### "Module not found" errors

- Check that all dependencies are properly installed
- Verify that import paths are correct
- Ensure that required modules are not in devDependencies

### Code signing failures

- Verify that your certificate is valid and properly configured
- Check that you have the correct permissions
- Ensure your Apple Developer account or Microsoft account has necessary permissions

### Companion service integration issues

- Verify that paths to companion services are correct
- Check that all required dependencies for the services are bundled
- Test companion services independently before packaging

## Continuous Integration Setup

For automated builds, consider setting up GitHub Actions or similar CI/CD:

```yaml
# Example GitHub Actions workflow
name: Build Electron App

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
        
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Set up pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10.6.3
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build Next.js app
        run: pnpm build
        
      - name: Build Electron app
        run: |
          cd electron
          pnpm install
          pnpm pack:${{ matrix.os == 'macos-latest' && 'mac' || matrix.os == 'windows-latest' && 'win' || 'linux' }}
          
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: electron/dist/
```

## Distribution Channels

After building your application, consider these distribution options:

- **Direct download**: Host the installers on your own website
- **GitHub Releases**: Attach builds to releases on GitHub
- **App stores**: Submit to Mac App Store, Microsoft Store, etc. (requires additional preparation)
- **Auto-updates**: Configure electron-updater to fetch updates from your server