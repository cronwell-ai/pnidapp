# Electron Integration Testing Guide

This document outlines comprehensive test procedures to validate the Electron integration of the P&ID App.

## 1. Setup Test Environment

### Prerequisites
- macOS system (for macOS-specific tests)
- Node.js 18+
- pnpm 10.6.3+
- Python 3.9+ with pip

### Initial Setup
1. Clone the repository
   ```bash
   git clone <repository-url>
   cd pnidapp
   ```

2. Install dependencies
   ```bash
   pnpm install
   cd electron
   pnpm install
   cd ..
   ```

3. Set up environment variables in `.env.local`
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_EXTERNAL_IP=localhost
   ```

4. Initialize companion services
   ```bash
   # Metadata parser
   cd companion/metadata-parser
   pnpm install
   cd ../pdf-export
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cd ../..
   ```

## 2. Unit Tests

### Electron Configuration Tests
- [ ] Verify main.js has secure settings (`contextIsolation: true`, `nodeIntegration: false`)
- [ ] Check preload.js properly exposes only safe IPC methods
- [ ] Validate package.json configuration for build targets

### React Integration Tests
- [ ] Verify ElectronProvider correctly detects environment
- [ ] Test file operations in isolation
- [ ] Verify service health monitoring

### Security Tests
- [ ] Test IPC input validation
- [ ] Check service communication security
- [ ] Verify safe file handling

To run React component tests:
```bash
# Future implementation - unit tests need to be created
pnpm test
```

## 3. Integration Tests

### Development Mode Testing

1. Start the application in development mode
   ```bash
   # Terminal 1 - Start Next.js
   pnpm dev
   
   # Terminal 2 - Start metadata parser
   cd companion/metadata-parser
   PORT=7123 pnpm dev
   
   # Terminal 3 - Start PDF export
   cd companion/pdf-export
   source venv/bin/activate
   python main.py
   
   # Terminal 4 - Start Electron
   cd electron
   pnpm dev
   ```

2. Complete the following test cases:

#### Core Functionality
- [ ] Application launches without errors
- [ ] Main window displays correctly
- [ ] Companion services status indicators show "running"

#### File Operations
- [ ] Test file selection dialog
- [ ] Test file saving dialog
- [ ] Verify correct MIME type detection

#### macOS Integration
- [ ] Verify native menu integration
- [ ] Test system notifications
- [ ] Verify sandbox permissions

#### Error Handling
- [ ] Stop one companion service and verify error detection
- [ ] Verify service auto-restart functionality
- [ ] Test offline behavior

### Production Build Testing

1. Build the application
   ```bash
   pnpm build
   cd electron
   pnpm build
   ```

2. Test the packaged application by opening the .dmg file from electron/dist/

3. Complete the following test cases:

#### Installation & Startup
- [ ] Application installs without errors
- [ ] Application launches without errors
- [ ] Companion services start correctly

#### Performance Metrics
- [ ] Measure startup time (should be < 5 seconds)
- [ ] Monitor memory usage during typical operations
- [ ] Test with large P&ID files to assess performance

#### Security Tests
- [ ] Verify sandbox restrictions
- [ ] Test file system access limitations
- [ ] Verify network request handling

## 4. Web Compatibility Tests

To test web compatibility, run the application without Electron:

```bash
pnpm dev
```

Then verify that:
- [ ] All functionality works correctly in browser
- [ ] File operations use web fallbacks
- [ ] UI adapts appropriately to web environment

## 5. Cross-Platform Testing

If available, test on additional platforms:
- [ ] Windows 10/11
- [ ] Linux (Ubuntu 20.04+)

## 6. Reporting Issues

For any issues discovered during testing:
1. Capture detailed information:
   - Environment details (OS, Node version)
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots or logs
   
2. Report in the project issue tracker with label "electron-integration"

## Troubleshooting Common Issues

### Companion Services Not Starting
- Check logs in the main process console
- Verify required dependencies (Node.js, Python)
- Check for port conflicts with other applications

### Build Failures
- Clear node_modules and reinstall dependencies
- Ensure electron-builder is properly configured
- Check for version conflicts in package.json

### UI Rendering Issues
- Check for CSS conflicts specific to Electron
- Inspect element positioning with developer tools
- Test different screen resolutions

### Performance Problems
- Use Electron DevTools to profile performance
- Check for memory leaks during extended use
- Monitor CPU/memory usage for abnormal patterns