# Electron Security Guidelines

This document outlines security best practices implemented in the P&ID App Electron integration and provides guidance for maintaining high security standards during future development.

## Security Measures Implementation Status

| Security Measure | Status | Notes |
|------------------|--------|-------|
| Context Isolation | ✅ Implemented | Prevents prototype pollution attacks |
| Node Integration Disabled | ✅ Implemented | Prevents direct access to Node.js APIs |
| Sandbox Enabled | ✅ Implemented | Restricts privileges in renderer process |
| IPC Validation | ✅ Implemented | Validates all IPC messages |
| Content Security Policy | ❌ Not Implemented | Should be added for production |
| ASAR Archive | ✅ Implemented | Protects source code |
| Latest Electron Version | ✅ Implemented | Using Electron 30.0.0 |
| Permission Model | ✅ Implemented | Follows macOS security model |
| Secure File Operations | ✅ Implemented | Path validation & error handling |
| Secure IPC Communication | ✅ Implemented | Limited exposed APIs |

## Electron Security Principles

### 1. Security Model Overview

The P&ID App follows Electron's recommended security model:

- **Main Process**: Privileged context with full Node.js access
- **Renderer Process**: Sandboxed environment with limited privileges
- **Preload Scripts**: Bridge between processes with explicit API exposure

### 2. Critical Security Settings

```javascript
// Good: Current implementation in main.js
const mainWindow = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true
  }
});
```

All three key security settings are properly enabled:
- `contextIsolation: true`: Prevents access to privileged APIs from renderer
- `nodeIntegration: false`: Blocks direct Node.js access from renderer
- `sandbox: true`: Applies additional Chromium sandbox restrictions

### 3. IPC Communication Security

**Current Implementation**:
- Uses `contextBridge` to expose specific APIs only
- Validates all IPC inputs and parameters
- Handles errors securely

Example of secure IPC implementation:

```javascript
// Good: Input validation in preload.js
const validateOptions = (options) => {
  if (typeof options !== 'object') return {};
  
  // Create sanitized copy of options
  const sanitized = {};
  
  // Only allow specific properties
  if (options.filters && Array.isArray(options.filters)) {
    sanitized.filters = options.filters.map(filter => ({
      name: typeof filter.name === 'string' ? filter.name : 'Files',
      extensions: Array.isArray(filter.extensions) ? 
        filter.extensions.filter(ext => typeof ext === 'string') : []
    }));
  }
  
  // ... more validation
  
  return sanitized;
};
```

### 4. File System Security

**Current Implementation**:
- Validates file paths before operations
- Uses proper error handling
- Restricts file operations to user-selected paths

## Security Recommendations

### 1. Add Content Security Policy

Add a CSP to restrict what resources can be loaded:

```javascript
// Add to main.js
mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        "default-src 'self'; script-src 'self'; connect-src 'self' https://api.supabase.io; img-src 'self' data:;"
      ]
    }
  })
});
```

### 2. Implement HTTPS for Services

Update companion services to use HTTPS in production:

```javascript
// In main.js
const isProduction = process.env.NODE_ENV === 'production';

// For metadata parser
metadataParserProcess = spawn('node', ['src/server.js'], {
  env: {
    ...process.env,
    PORT: '7123',
    USE_HTTPS: isProduction ? 'true' : 'false' // Enable HTTPS in production
  }
});
```

### 3. Regular Dependency Updates

Implement a process for regular security updates:

```bash
# Add script to package.json
"scripts": {
  "security-check": "npx audit-ci --high"
}
```

### 4. Add Process Hardening

Implement additional security protections:

```javascript
// Add to main.js after app is ready
app.whenReady().then(() => {
  // ... existing code
  
  // Set additional security options
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'X-Content-Type-Options': ['nosniff'],
        'X-Frame-Options': ['SAMEORIGIN'],
        'X-XSS-Protection': ['1; mode=block']
      }
    });
  });
});
```

## macOS-Specific Security

### 1. Hardened Runtime

The app uses Apple's Hardened Runtime with these entitlements:

```xml
<!-- build/entitlements.mac.plist -->
<key>com.apple.security.cs.allow-jit</key>
<true/>
<key>com.apple.security.network.client</key>
<true/>
<key>com.apple.security.files.user-selected.read-write</key>
<true/>
```

### 2. App Sandbox

For Mac App Store distribution, implement App Sandbox with these entitlements:

```xml
<!-- Recommended additions for Mac App Store -->
<key>com.apple.security.app-sandbox</key>
<true/>
<key>com.apple.security.network.client</key>
<true/>
<key>com.apple.security.files.user-selected.read-write</key>
<true/>
```

### 3. Notarization

For distribution outside Mac App Store, implement notarization:

```bash
# After building the app
xcrun notarytool submit ./dist/P&ID\ App.dmg \
  --apple-id your_apple_id@example.com \
  --password your_app_specific_password \
  --team-id YOUR_TEAM_ID
```

## Web to Desktop Security Considerations

When transitioning between web and desktop:

1. **Environment Detection**: Always check environment before accessing platform-specific APIs
2. **Feature Detection**: Use feature detection instead of platform checks when possible
3. **Security Model Differences**: Be aware of different security contexts (browser sandbox vs Electron)
4. **Authentication**: Use different auth flows for web vs desktop
5. **File System Access**: Provide appropriate fallbacks for file system operations

## Security Testing

Conduct these security tests regularly:

1. **Vulnerability Scanning**:
   ```bash
   npm audit
   npx electronegativity -i .
   ```

2. **Manual Testing**:
   - Attempt to inject code via inputs
   - Try to access Node.js APIs from renderer
   - Attempt to bypass file system restrictions
   - Test offline and network error scenarios

3. **Static Analysis**:
   ```bash
   npx eslint --plugin security .
   ```

## Reporting Security Issues

If you discover security vulnerabilities, please:

1. DO NOT post about the issue publicly
2. Email security@pnidapp.com with details
3. Include steps to reproduce the issue
4. Allow time for the issue to be addressed before disclosure