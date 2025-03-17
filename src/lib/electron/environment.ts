import { isElectron } from './detection';

// API endpoint configurations for the companion services
interface ServiceEndpoints {
  metadataParser: string;
  pdfExport: string;
}

// Get the API endpoints appropriate for the current environment
export const getServiceEndpoints = (): ServiceEndpoints => {
  if (isElectron()) {
    // In Electron, we use localhost with specific ports for companion services
    return {
      metadataParser: 'http://localhost:7123',
      pdfExport: 'http://localhost:6123'
    };
  } else {
    // In web environment, use environment variables or predefined endpoints
    const baseMetadataUrl = process.env.NEXT_PUBLIC_METADATA_PARSER_URL || 
      (process.env.NEXT_PUBLIC_EXTERNAL_IP ? 
        `http://${process.env.NEXT_PUBLIC_EXTERNAL_IP}:7123` : 
        'http://localhost:7123');
    
    const basePdfExportUrl = process.env.NEXT_PUBLIC_PDF_EXPORT_URL || 
      (process.env.NEXT_PUBLIC_EXTERNAL_IP ? 
        `http://${process.env.NEXT_PUBLIC_EXTERNAL_IP}:6123` : 
        'http://localhost:6123');
    
    return {
      metadataParser: baseMetadataUrl,
      pdfExport: basePdfExportUrl
    };
  }
};

// Get appropriate storage strategy based on environment
export const getStorageStrategy = () => {
  if (isElectron()) {
    // In Electron, we might want to use the filesystem for some data
    return 'electron';
  } else {
    // In web, we use IndexedDB or LocalStorage as appropriate
    return 'web';
  }
};

// Configure auth flow based on environment
export const getAuthStrategy = () => {
  // Both web and Electron use Supabase auth, but paths might differ
  return {
    callbackUrl: isElectron() 
      ? '/auth/callback?platform=electron' 
      : '/auth/callback'
  };
};