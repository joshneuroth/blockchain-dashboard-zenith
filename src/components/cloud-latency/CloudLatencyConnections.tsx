
import React from 'react';
import { CloudLatencyResult } from '@/hooks/blockchain/useCloudLatency';
import CloudRegionBox from './CloudRegionBox';
import CloudProviderConnection from './CloudProviderConnection';

interface CloudLatencyConnectionsProps {
  results: CloudLatencyResult[];
}

// Group results by provider
const groupResultsByProvider = (results: CloudLatencyResult[]) => {
  const groupedResults: Record<string, CloudLatencyResult[]> = {};
  
  results.forEach(result => {
    if (!groupedResults[result.provider_name]) {
      groupedResults[result.provider_name] = [];
    }
    groupedResults[result.provider_name].push(result);
  });
  
  return groupedResults;
};

const CloudLatencyConnections: React.FC<CloudLatencyConnectionsProps> = ({ results }) => {
  const groupedResults = groupResultsByProvider(results);
  const providers = Object.keys(groupedResults);
  
  return (
    <div className="relative my-8 min-h-[200px]">
      {/* Cloud region box */}
      <CloudRegionBox />
      
      {/* Connection lines and results, grouped by provider */}
      <div className="ml-[220px] space-y-8">
        {providers.length > 0 ? (
          providers.map((providerName) => (
            <div key={providerName} className="mb-6">
              <h3 className="font-medium text-sm mb-2">{providerName}</h3>
              <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                {groupedResults[providerName].map((result, index) => (
                  <CloudProviderConnection key={index} result={result} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 italic">No latency data available</div>
        )}
      </div>
    </div>
  );
};

export default CloudLatencyConnections;
