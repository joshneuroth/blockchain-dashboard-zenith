
import React from 'react';
import { CloudLatencyResult } from '@/hooks/blockchain/useCloudLatency';
import CloudRegionBox from './CloudRegionBox';
import CloudProviderConnection from './CloudProviderConnection';

interface CloudLatencyConnectionsProps {
  results: CloudLatencyResult[];
}

const CloudLatencyConnections: React.FC<CloudLatencyConnectionsProps> = ({ results }) => {
  return (
    <div className="relative my-8 min-h-[200px]">
      {/* Cloud region box */}
      <CloudRegionBox />
      
      {/* Connection lines and results */}
      <div className="ml-[220px] space-y-6">
        {results.map((result, index) => (
          <CloudProviderConnection key={index} result={result} />
        ))}
        
        {results.length === 0 && (
          <div className="text-gray-500 italic">No latency data available</div>
        )}
      </div>
    </div>
  );
};

export default CloudLatencyConnections;
