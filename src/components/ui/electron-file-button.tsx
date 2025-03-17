import React from 'react';
import { Button, ButtonProps } from './button';
import { useElectron } from '@/lib/electron';

interface ElectronFileButtonProps extends ButtonProps {
  onFileSelected: (files: File[]) => void;
  fileOptions?: {
    filters?: Array<{ name: string; extensions: string[] }>;
    properties?: Array<string>;
    defaultPath?: string;
  };
}

export const ElectronFileButton: React.FC<ElectronFileButtonProps> = ({
  onFileSelected,
  fileOptions,
  children,
  ...props
}) => {
  const { isElectronApp, openFileDialog } = useElectron();

  const handleClick = async () => {
    if (isElectronApp) {
      try {
        // Use Electron's open dialog
        const result = await openFileDialog({
          filters: fileOptions?.filters || [
            { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] },
            { name: 'PDF Documents', extensions: ['pdf'] }
          ],
          properties: fileOptions?.properties || ['openFile'],
          defaultPath: fileOptions?.defaultPath || undefined
        });

        if (!result.canceled && result.filePaths?.length > 0) {
          // Convert the file paths to File objects
          const files = await Promise.all(
            result.filePaths.map(async (filePath: string) => {
              // In Electron, we have the actual file path
              // Create a File object similar to what the web File API would provide
              return new File(
                [await window.electron!.readFile(filePath)],
                filePath.split('/').pop() || 'file',
                {
                  type: getMimeType(filePath)
                }
              );
            })
          );
          
          onFileSelected(files);
        }
      } catch (error) {
        console.error('Error selecting file:', error);
      }
    } else {
      // Create a file input for web fallback
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = fileOptions?.filters
        ?.map(filter => `.${filter.extensions.join(',.').startsWith('.') ? filter.extensions.join(',.') : '.' + filter.extensions.join(',.') }`)
        .join(',') || 'image/jpeg,image/png,application/pdf';
      
      input.multiple = fileOptions?.properties?.includes('multiSelections') || false;
      
      input.onchange = (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        if (files.length > 0) {
          onFileSelected(files);
        }
      };
      
      input.click();
    }
  };

  // Helper function to determine MIME type from file extension
  const getMimeType = (filePath: string): string => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
};