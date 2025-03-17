# Electron Desktop Application Troubleshooting

This guide provides solutions for common issues that may arise when developing, building, or running the P&ID App Electron desktop application.

## Development Environment Issues

### Electron App Won't Start

| Issue | Solution |
|-------|----------|
| "Cannot find module 'electron'" | Run `cd electron && pnpm install` to install dependencies |
| White/blank screen on launch | Ensure Next.js is running on port 3000 before starting Electron |
| Companion services not connecting | Verify that metadata parser (port 7123) and PDF export (port 6123) services are running |
| Error about missing .env variables | Make sure all required environment variables are set in both project root and electron directory |

### Development Workflow

| Issue | Solution |
|-------|----------|
| Changes not reflected in Electron | Refresh the Electron window with Cmd+R (macOS) or Ctrl+R (Windows/Linux) |
| DevTools not showing | Press F12 or use View > Toggle Developer Tools in the Electron menu |
| Electron crashes on startup | Check main process logs in the terminal where you started Electron |
| IPC communication errors | Verify that exposed APIs in preload.js match what you're calling from the renderer |

## Build Issues

### Packaging Failures

| Issue | Solution |
|-------|----------|
| electron-builder fails | Check `electron/package.json` for correct configuration and ensure all dependencies are installed |
| "Unable to find Electron" | Run `cd electron && pnpm install electron --save-dev` to install Electron |
| Missing icon files | Ensure that icon files exist in the electron/build directory |
| "Error: Exit code: ENOENT" | Check that all paths in your build configuration exist |

### macOS-specific Build Issues

| Issue | Solution |
|-------|----------|
| Notarization fails | Verify Apple Developer credentials and ensure you have an App-Specific Password |
| App won't launch on macOS | Check code signing with: `codesign --verify --verbose ./electron/dist/mac/P&ID\ App.app` |
| "App is damaged" message | The app needs to be properly signed and notarized with Apple |
| Hardened Runtime issues | Verify entitlements in `electron/build/entitlements.mac.plist` |

## Runtime Issues

### Application Behavior

| Issue | Solution |
|-------|----------|
| File dialogs not working | Check IPC implementation in main.js and preload.js |
| Companion services not starting | Check main.js service startup code and look for error messages in the console |
| Menu items not functioning | Verify click handlers in the setupMenu function in main.js |
| Authentication problems | Check that auth flow properly handles the Electron environment |

### Performance Issues

| Issue | Solution |
|-------|----------|
| Slow startup time | Consider lazy-loading large components and optimizing companion service startup |
| High memory usage | Check for memory leaks with the Memory tab in DevTools |
| UI responsiveness issues | Use Performance tab in DevTools to profile rendering performance |
| File operations are slow | Consider using worker threads for heavy file operations |

## Security Issues

| Issue | Solution |
|-------|----------|
| CSP warnings in console | Implement a Content Security Policy as detailed in electron-security.md |
| Insecure resource requests | Ensure all resources are loaded via HTTPS or from local sources |
| Unauthorized file access | Validate paths and use dialog APIs for user-initiated file operations |
| Remote content vulnerabilities | Use proper input sanitization and validate all external data |

## Diagnosing Issues

### Debugging Tools

```bash
# Run Electron with full logs
cd electron
DEBUG=electron* pnpm dev

# Check for port conflicts
lsof -i -P | grep LISTEN | grep -E '3000|7123|6123'

# Verify service health
curl http://localhost:7123/health
curl http://localhost:6123/health
```

### Logs and Error Information

When Electron is running, you can access different types of logs:

1. **Main Process Logs**: Visible in the terminal where you started Electron
2. **Renderer Process Logs**: Visible in DevTools Console (F12)
3. **Companion Service Logs**: Visible in their respective terminals or Electron console

### Verbose Logging

To enable verbose logging:

```js
// In main.js, add:
app.commandLine.appendSwitch('enable-logging');
app.commandLine.appendSwitch('log-level', '0');
```

## Common Error Messages and Solutions

| Error Message | Solution |
|---------------|----------|
| "Error: spawn ENOENT" | The companion service executable wasn't found. Check paths in main.js |
| "Error: A JavaScript error occurred in the main process" | Check the terminal output for detailed error information |
| "Cannot read properties of undefined" | Check for null references in IPC handlers or preload script |
| "The remote object has been disconnected" | Connection to companion service was lost. Check service status |
| "Not allowed to load local resource" | Check CSP settings and verify file paths are correct |

## Expert-Level Troubleshooting

For advanced issues, try these approaches:

1. **Process Monitoring**: 
   ```bash
   # Monitor all Electron and Node processes
   ps aux | grep -E "electron|node|python" | grep -v grep
   ```

2. **Network Debugging**:
   ```bash
   # Monitor all network connections by the app
   sudo lsof -i -P | grep -E "electron|node|python"
   ```

3. **Trace IPC Messages**:
   Add this to main.js:
   ```js
   ipcMain.on('*', (event, ...args) => {
     console.log('IPC received:', event.channel, args);
   });
   ```

## Upgrading Electron

When upgrading Electron to a newer version:

1. Update the version in electron/package.json
2. Check the [Electron Breaking Changes](https://www.electronjs.org/docs/latest/breaking-changes) documentation
3. Update any deprecated APIs
4. Rebuild and test thoroughly

## Getting Help

If you've tried the solutions in this guide and still have issues:

1. Check GitHub issues to see if others have encountered the same problem
2. Enable verbose logging and gather detailed error information
3. Create a new GitHub issue with:
   - Error messages and stack traces
   - Steps to reproduce
   - Environment information (OS, Electron version, Node version)
   - What you've tried already

## Preventative Measures

To avoid common issues:

- Always run all services before starting Electron
- Use the provided scripts in CLAUDE.md for standard operations
- Check service health before performing operations
- Test frequently during development
- Keep Electron and dependencies up to date