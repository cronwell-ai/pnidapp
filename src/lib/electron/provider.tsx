import React, { createContext, useContext, useEffect, useState } from 'react';
import { isElectron, setupElectronListeners } from './detection';
import { useRouter } from 'next/navigation';

interface ElectronContextType {
  isElectronApp: boolean;
  openFileDialog: (options?: any) => Promise<any>;
  saveFileDialog: (options?: any, data?: any) => Promise<any>;
}

// Create a context for Electron functionality
const ElectronContext = createContext<ElectronContextType>({
  isElectronApp: false,
  openFileDialog: async () => ({ canceled: true }),
  saveFileDialog: async () => ({ success: false })
});

// Custom hook to use the Electron context
export const useElectron = () => useContext(ElectronContext);

export const ElectronProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isElectronApp, setIsElectronApp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Set isElectronApp state based on environment detection
    setIsElectronApp(isElectron());
    
    // Only set up listeners in Electron environment
    if (isElectron()) {
      // Setup listeners for Electron events
      const cleanup = setupElectronListeners(
        // New project handler
        () => {
          router.push('/dashboard');
          // Additional logic to trigger new project dialog
        },
        // Export PDF handler
        () => {
          // Get current project ID from URL or state
          const urlParts = window.location.pathname.split('/');
          const projectIndex = urlParts.indexOf('pnids');
          
          if (projectIndex !== -1 && urlParts.length > projectIndex + 1) {
            const projectId = urlParts[projectIndex + 1];
            router.push(`/pnids/${projectId}/export`);
          }
        },
        // Navigation handler
        (path) => {
          router.push(path);
        }
      );
      
      // Clean up listeners when component unmounts
      return cleanup;
    }
  }, [router]);

  // Methods for file dialogs
  const openFileDialog = async (options: any = {}) => {
    if (isElectronApp) {
      try {
        return await window.electron!.selectFile(options);
      } catch (error) {
        console.error('Error in open file dialog:', error);
        return { canceled: true };
      }
    }
    return { canceled: true };
  };

  const saveFileDialog = async (options: any = {}, data: any = null) => {
    if (isElectronApp) {
      try {
        return await window.electron!.saveFile(options, data);
      } catch (error) {
        console.error('Error in save file dialog:', error);
        return { success: false };
      }
    }
    return { success: false };
  };

  const value = {
    isElectronApp,
    openFileDialog,
    saveFileDialog
  };

  return (
    <ElectronContext.Provider value={value}>
      {children}
    </ElectronContext.Provider>
  );
};