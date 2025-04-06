
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface CloudLatencyErrorProps {
  error: string;
  networkId: string;
}

const CloudLatencyError: React.FC<CloudLatencyErrorProps> = ({ error, networkId }) => {
  return (
    <div className="py-6">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading cloud latency data</AlertTitle>
        <AlertDescription>
          {error}
          <div className="mt-2 text-xs">
            Network ID: {networkId}
          </div>
        </AlertDescription>
      </Alert>
      <p className="text-sm mt-2 text-muted-foreground">
        This may be due to network connectivity issues or API changes. The API expects numeric IDs for networks (e.g., "1" for Ethereum).
      </p>
    </div>
  );
};

export default CloudLatencyError;
