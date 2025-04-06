
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info, Bug } from 'lucide-react';

interface CloudLatencyEmptyProps {
  networkId: string;
  networkName: string;
  rawApiResponse: any;
}

const CloudLatencyEmpty: React.FC<CloudLatencyEmptyProps> = ({ 
  networkId, 
  networkName, 
  rawApiResponse 
}) => {
  return (
    <div className="py-6">
      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle>No data available</AlertTitle>
        <AlertDescription>
          No cloud latency data available for {networkName} (ID: {networkId}).
          <div className="mt-2 text-xs">
            The API might not have data for this network yet.
          </div>
        </AlertDescription>
      </Alert>
      
      {rawApiResponse && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto">
          <div className="flex items-center mb-2">
            <Bug size={16} className="mr-2" />
            <span className="font-medium">Raw API Response (Debug):</span>
          </div>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(rawApiResponse, null, 2)}
          </pre>
        </div>
      )}
      
      <p className="text-sm mt-2 text-muted-foreground">
        We're constantly adding more networks and data. Check back later for updates.
      </p>
    </div>
  );
};

export default CloudLatencyEmpty;
