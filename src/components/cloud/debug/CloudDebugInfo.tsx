
import React from 'react';
import { Bug } from 'lucide-react';
import { CloudLatencyData } from '@/hooks/useCloudLatency';

interface CloudDebugInfoProps {
  networkId: string;
  data: CloudLatencyData[];
}

const CloudDebugInfo: React.FC<CloudDebugInfoProps> = ({ networkId, data }) => {
  return (
    <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
      <div className="flex items-center mb-2">
        <Bug size={16} className="mr-2" />
        <span className="font-medium">Debug Information:</span>
      </div>
      <p className="text-xs">Network ID: {networkId}</p>
      <p className="text-xs">Data items: {data.length}</p>
      {data.length > 0 && (
        <>
          <p className="text-xs">First provider: {data[0]?.provider}</p>
          <p className="text-xs">Data format: {JSON.stringify(data[0], null, 2)}</p>
        </>
      )}
    </div>
  );
};

export default CloudDebugInfo;
