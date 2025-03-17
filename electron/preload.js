const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const { Buffer } = require('buffer');

// Validate IPC options to prevent security issues
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
  
  if (options.properties && Array.isArray(options.properties)) {
    sanitized.properties = options.properties.filter(
      prop => typeof prop === 'string' &&
      ['openFile', 'openDirectory', 'multiSelections', 'createDirectory'].includes(prop)
    );
  }
  
  if (options.defaultPath && typeof options.defaultPath === 'string') {
    sanitized.defaultPath = options.defaultPath;
  }
  
  return sanitized;
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // File System Operations
  selectFile: (options) => ipcRenderer.invoke('select-file', validateOptions(options)),
  saveFile: (options, data) => ipcRenderer.invoke('save-file', validateOptions(options), data),
  readFile: (filePath) => {
    // Validate file path
    if (typeof filePath !== 'string') {
      return Promise.reject(new Error('Invalid file path'));
    }
    
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) return reject(err);
        resolve(Buffer.from(data));
      });
    });
  },
  // Service health check
  checkServicesHealth: () => ipcRenderer.invoke('check-services-health'),
  
  // Navigation and UI
  onNewProject: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = () => callback();
    ipcRenderer.on('new-project', listener);
    return () => ipcRenderer.removeListener('new-project', listener);
  },
  onExportPdf: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = () => callback();
    ipcRenderer.on('export-pdf', listener);
    return () => ipcRenderer.removeListener('export-pdf', listener);
  },
  onNavigate: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_, path) => {
      if (typeof path === 'string') callback(path);
    };
    ipcRenderer.on('navigate', listener);
    return () => ipcRenderer.removeListener('navigate', listener);
  },
  
  // Environment detection
  platform: process.platform,
  isElectron: true
});