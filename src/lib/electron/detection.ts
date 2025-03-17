// Helper to detect if we're running in Electron
export const isElectron = (): boolean => {
  // Check if window.electron exists (exposed by preload script)
  return typeof window !== 'undefined' && !!window.electron;
};

// Get the current platform when running in Electron
export const getElectronPlatform = (): string | null => {
  if (isElectron()) {
    return window.electron.platform;
  }
  return null;
};

// Helper for electron-specific file operations
export const selectFile = async (options: any = {}): Promise<any> => {
  if (isElectron()) {
    return await window.electron.selectFile(options);
  }
  throw new Error('Not running in Electron');
};

export const saveFile = async (options: any = {}, data: any): Promise<any> => {
  if (isElectron()) {
    return await window.electron.saveFile(options, data);
  }
  throw new Error('Not running in Electron');
};

// Register listeners for Electron events
export const setupElectronListeners = (
  onNewProject?: () => void,
  onExportPdf?: () => void,
  onNavigate?: (path: string) => void
): (() => void) => {
  if (!isElectron()) return () => {};

  const cleanupFunctions: Array<() => void> = [];

  if (onNewProject) {
    const removeNewProject = window.electron.onNewProject(() => {
      onNewProject();
    });
    cleanupFunctions.push(removeNewProject);
  }

  if (onExportPdf) {
    const removeExportPdf = window.electron.onExportPdf(() => {
      onExportPdf();
    });
    cleanupFunctions.push(removeExportPdf);
  }

  if (onNavigate) {
    const removeNavigate = window.electron.onNavigate((path: string) => {
      onNavigate(path);
    });
    cleanupFunctions.push(removeNavigate);
  }

  // Return a cleanup function that removes all listeners
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
};

// Define the Window electron interface for TypeScript
declare global {
  interface Window {
    electron?: {
      selectFile: (options: any) => Promise<any>;
      saveFile: (options: any, data: any) => Promise<any>;
      readFile: (filePath: string) => Promise<Buffer>;
      checkServicesHealth: () => Promise<{
        metadataParser: { running: boolean; details?: any; error?: string };
        pdfExport: { running: boolean; details?: any; error?: string };
      }>;
      onNewProject: (callback: () => void) => () => void;
      onExportPdf: (callback: () => void) => () => void;
      onNavigate: (callback: (path: string) => void) => () => void;
      platform: string;
      isElectron: boolean;
    };
  }
}