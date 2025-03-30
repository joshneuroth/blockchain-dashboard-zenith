
import React from 'react';
import { CloudLatencyResult } from '@/hooks/blockchain/useCloudLatency';
import CloudRegionBox from './CloudRegionBox';
import CloudProviderConnection from './CloudProviderConnection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  
  if (providers.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500 italic">No latency data available for the selected method</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {providers.map((providerName) => (
        <Card key={providerName} className="overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">{providerName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Cloud region box */}
              <CloudRegionBox />
              
              {/* Connection lines and results for this provider */}
              <div className="ml-[220px] space-y-4">
                {groupedResults[providerName].map((result, index) => (
                  <CloudProviderConnection key={index} result={result} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CloudLatencyConnections;
