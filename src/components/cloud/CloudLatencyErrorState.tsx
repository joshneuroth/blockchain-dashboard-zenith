
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface CloudLatencyErrorStateProps {
  message: string;
  submessage?: string;
  debugData?: any;
}

const CloudLatencyErrorState: React.FC<CloudLatencyErrorStateProps> = ({ 
  message, 
  submessage, 
  debugData 
}) => {
  return (
    <div className="text-center py-4 flex flex-col items-center">
      <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
      <p>{message}</p>
      {submessage && (
        <p className="text-sm text-muted-foreground mt-2">
          {submessage}
        </p>
      )}
      {debugData && (
        <pre className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 text-xs rounded overflow-x-auto max-w-full">
          {JSON.stringify(debugData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default CloudLatencyErrorState;
