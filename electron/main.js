const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';
const os = require('os');
const fs = require('fs');

// Services processes
let metadataParserProcess = null;
let pdfExportProcess = null;

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

async function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    titleBarStyle: 'hiddenInset', // macOS-specific: sleek title bar 
    backgroundColor: '#1a1a1a' // Matches dark theme
  });

  // Load the app
  if (isDev) {
    // In development, load from Next.js dev server
    await mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from exported Next.js static files or SSR server
    await mainWindow.loadURL('http://localhost:3000');
    // Alternative: load from static export
    // await mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  // Set up native macOS menu
  setupMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupMenu() {
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Preferences',
          accelerator: 'Cmd+,',
          click: () => {
            mainWindow.webContents.send('navigate', '/dashboard/preferences');
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'Cmd+N',
          click: () => {
            mainWindow.webContents.send('new-project');
          }
        },
        {
          label: 'Open Project',
          accelerator: 'Cmd+O',
          click: () => {
            mainWindow.webContents.send('navigate', '/dashboard');
          }
        },
        { type: 'separator' },
        {
          label: 'Export PDF',
          accelerator: 'Cmd+E',
          click: () => {
            mainWindow.webContents.send('export-pdf');
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            mainWindow.webContents.send('navigate', '/docs');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Start companion services
function startCompanionServices() {
  try {
    // Start metadata parser service
    const metadataParserPath = isDev 
      ? path.join(__dirname, '../companion/metadata-parser') 
      : path.join(process.resourcesPath, 'companion/metadata-parser');
    
    // Ensure path exists
    if (!fs.existsSync(metadataParserPath)) {
      throw new Error(`Metadata parser path not found: ${metadataParserPath}`);
    }
    
    metadataParserProcess = spawn('node', ['src/server.js'], {
      cwd: metadataParserPath,
      env: {
        ...process.env,
        PORT: '7123',
        USE_HTTPS: 'false',
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY
      }
    });

    metadataParserProcess.stdout.on('data', (data) => {
      console.log(`Metadata Parser: ${data}`);
    });

    metadataParserProcess.stderr.on('data', (data) => {
      console.error(`Metadata Parser Error: ${data}`);
    });
    
    metadataParserProcess.on('error', (err) => {
      console.error('Failed to start metadata parser:', err);
      dialog.showErrorBox(
        'Service Startup Error',
        `The metadata parser service failed to start: ${err.message}\n\nThe app may not function correctly.`
      );
    });
    
    metadataParserProcess.on('exit', (code, signal) => {
      if (code !== 0) {
        console.error(`Metadata parser exited with code ${code} and signal ${signal}`);
        
        // Attempt to restart if not shutting down
        if (!app.isQuitting) {
          console.log('Attempting to restart metadata parser...');
          startMetadataParser();
        }
      }
    });

    // Start PDF export service
    const pdfExportPath = isDev 
      ? path.join(__dirname, '../companion/pdf-export') 
      : path.join(process.resourcesPath, 'companion/pdf-export');
    
    // Ensure path exists
    if (!fs.existsSync(pdfExportPath)) {
      throw new Error(`PDF export path not found: ${pdfExportPath}`);
    }
    
    const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
    
    pdfExportProcess = spawn(pythonExecutable, ['main.py'], {
      cwd: pdfExportPath,
      env: {
        ...process.env,
        PORT: '6123',
        USE_HTTPS: 'false'
      }
    });

    pdfExportProcess.stdout.on('data', (data) => {
      console.log(`PDF Export: ${data}`);
    });

    pdfExportProcess.stderr.on('data', (data) => {
      console.error(`PDF Export Error: ${data}`);
    });
    
    pdfExportProcess.on('error', (err) => {
      console.error('Failed to start PDF export service:', err);
      dialog.showErrorBox(
        'Service Startup Error',
        `The PDF export service failed to start: ${err.message}\n\nThe app may not function correctly.`
      );
    });
    
    pdfExportProcess.on('exit', (code, signal) => {
      if (code !== 0) {
        console.error(`PDF export service exited with code ${code} and signal ${signal}`);
        
        // Attempt to restart if not shutting down
        if (!app.isQuitting) {
          console.log('Attempting to restart PDF export service...');
          startPdfExport();
        }
      }
    });
    
    // Start health check
    startServiceHealthCheck();
    
  } catch (error) {
    console.error('Error starting companion services:', error);
    dialog.showErrorBox(
      'Service Initialization Error',
      `Failed to initialize companion services: ${error.message}\n\nThe app may not function correctly.`
    );
  }
}

// Separate functions for individual service startup
function startMetadataParser() {
  // Implementation similar to the one in startCompanionServices
  // This allows for targeted restarts
  const metadataParserPath = isDev 
    ? path.join(__dirname, '../companion/metadata-parser') 
    : path.join(process.resourcesPath, 'companion/metadata-parser');
  
  metadataParserProcess = spawn('node', ['src/server.js'], {
    cwd: metadataParserPath,
    env: {
      ...process.env,
      PORT: '7123',
      USE_HTTPS: 'false',
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY
    }
  });
  
  // Add all event listeners as in startCompanionServices
}

function startPdfExport() {
  // Implementation similar to the one in startCompanionServices
  // This allows for targeted restarts
  const pdfExportPath = isDev 
    ? path.join(__dirname, '../companion/pdf-export') 
    : path.join(process.resourcesPath, 'companion/pdf-export');
  
  const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
  
  pdfExportProcess = spawn(pythonExecutable, ['main.py'], {
    cwd: pdfExportPath,
    env: {
      ...process.env,
      PORT: '6123',
      USE_HTTPS: 'false'
    }
  });
  
  // Add all event listeners as in startCompanionServices
}

// Set up health check for services
let healthCheckInterval;
function startServiceHealthCheck() {
  // Clear any existing interval
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  
  // Check services every 30 seconds
  healthCheckInterval = setInterval(async () => {
    try {
      // Check metadata parser health
      const metadataResponse = await fetch('http://localhost:7123/health');
      if (!metadataResponse.ok) {
        console.error('Metadata parser health check failed');
        // Only restart if process is not running
        if (!metadataParserProcess || metadataParserProcess.exitCode !== null) {
          startMetadataParser();
        }
      }
      
      // Check PDF export health
      const pdfExportResponse = await fetch('http://localhost:6123/health');
      if (!pdfExportResponse.ok) {
        console.error('PDF export health check failed');
        // Only restart if process is not running
        if (!pdfExportProcess || pdfExportProcess.exitCode !== null) {
          startPdfExport();
        }
      }
    } catch (error) {
      console.error('Service health check failed:', error);
      // Don't restart here as error might be due to network, not service
    }
  }, 30000);
}

// IPC handlers for communication between renderer and main processes
function setupIPC() {
  // Handle file selection
  ipcMain.handle('select-file', async (event, options) => {
    try {
      // Security check: ensure options are valid
      if (!options || typeof options !== 'object') {
        options = {};
      }
      
      // Sanitize file filters for added security
      if (options.filters && Array.isArray(options.filters)) {
        options.filters = options.filters.map(filter => ({
          name: typeof filter.name === 'string' ? filter.name : 'Files',
          extensions: Array.isArray(filter.extensions) ? 
            filter.extensions.filter(ext => typeof ext === 'string') : []
        }));
      }
      
      // Open file dialog
      const result = await dialog.showOpenDialog(mainWindow, options);
      return result;
    } catch (error) {
      console.error('Error in select-file handler:', error);
      return { canceled: true, error: error.message };
    }
  });

  // Handle file saving
  ipcMain.handle('save-file', async (event, options, data) => {
    try {
      // Security check: ensure options are valid
      if (!options || typeof options !== 'object') {
        options = {};
      }
      
      // Show save dialog
      const result = await dialog.showSaveDialog(mainWindow, options);
      
      if (!result.canceled && result.filePath) {
        // Ensure directory exists
        const directory = path.dirname(result.filePath);
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
        }
        
        // Validate data is Buffer or string
        let dataToWrite = data;
        if (!(data instanceof Buffer) && typeof data !== 'string') {
          dataToWrite = String(data);
        }
        
        // Write file with error handling
        fs.writeFileSync(result.filePath, dataToWrite);
        return { success: true, filePath: result.filePath };
      }
      return { success: false, canceled: true };
    } catch (error) {
      console.error('Error in save-file handler:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Handle check for companion services health
  ipcMain.handle('check-services-health', async () => {
    try {
      const results = {
        metadataParser: { running: false },
        pdfExport: { running: false }
      };
      
      // Check metadata parser
      try {
        const metadataResponse = await fetch('http://localhost:7123/health', { 
          method: 'GET',
          timeout: 1000 
        });
        results.metadataParser.running = metadataResponse.ok;
        if (metadataResponse.ok) {
          results.metadataParser.details = await metadataResponse.json();
        }
      } catch (error) {
        results.metadataParser.error = error.message;
      }
      
      // Check PDF export service
      try {
        const pdfExportResponse = await fetch('http://localhost:6123/health', { 
          method: 'GET',
          timeout: 1000 
        });
        results.pdfExport.running = pdfExportResponse.ok;
        if (pdfExportResponse.ok) {
          results.pdfExport.details = await pdfExportResponse.json();
        }
      } catch (error) {
        results.pdfExport.error = error.message;
      }
      
      return results;
    } catch (error) {
      console.error('Error checking services health:', error);
      return { error: error.message };
    }
  });
}

// App lifecycle events
app.whenReady().then(() => {
  createWindow();
  startCompanionServices();
  setupIPC();

  // macOS-specific behavior: re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // macOS-specific behavior: keep app running when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', (event) => {
  // Signal that app is quitting to prevent service restarts
  app.isQuitting = true;
  
  // Clear any health check interval
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
});

app.on('before-quit', () => {
  // Clean up companion services
  if (metadataParserProcess) {
    try {
      metadataParserProcess.kill();
    } catch (error) {
      console.error('Error killing metadata parser process:', error);
    }
  }
  
  if (pdfExportProcess) {
    try {
      pdfExportProcess.kill();
    } catch (error) {
      console.error('Error killing PDF export process:', error);
    }
  }
});