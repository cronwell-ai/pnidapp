import React, { useEffect, useState } from 'react';
import { Badge } from './badge';
import { useElectron } from '@/lib/electron';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface ServiceStatus {
  metadataParser: {
    running: boolean;
    details?: any;
    error?: string;
  };
  pdfExport: {
    running: boolean;
    details?: any;
    error?: string;
  };
}

export const ElectronServiceStatus: React.FC = () => {
  const { isElectronApp } = useElectron();
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isElectronApp) return;

    const checkStatus = async () => {
      try {
        const result = await window.electron!.checkServicesHealth();
        setStatus(result);
      } catch (error) {
        console.error('Error checking service status:', error);
      } finally {
        setLoading(false);
      }
    };

    // Check immediately
    checkStatus();

    // Then check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, [isElectronApp]);

  if (!isElectronApp || loading) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex space-x-2">
            <Badge 
              variant={status?.metadataParser.running ? "success" : "destructive"}
              className="cursor-help"
            >
              {status?.metadataParser.running ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              Metadata Parser
            </Badge>
            
            <Badge 
              variant={status?.pdfExport.running ? "success" : "destructive"}
              className="cursor-help"
            >
              {status?.pdfExport.running ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              PDF Export
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-md">
          <div className="space-y-2">
            <h4 className="font-bold">Service Status</h4>
            
            <div>
              <p className="font-semibold">Metadata Parser:</p>
              {status?.metadataParser.running ? (
                <p className="text-green-500">Running</p>
              ) : (
                <p className="text-red-500">
                  Not running{status?.metadataParser.error ? `: ${status.metadataParser.error}` : ''}
                </p>
              )}
            </div>
            
            <div>
              <p className="font-semibold">PDF Export:</p>
              {status?.pdfExport.running ? (
                <p className="text-green-500">Running</p>
              ) : (
                <p className="text-red-500">
                  Not running{status?.pdfExport.error ? `: ${status.pdfExport.error}` : ''}
                </p>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              If services aren't running, the app may not function correctly.
              Restart the application to fix the issue.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};