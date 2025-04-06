
import React from 'react';
import { CloudLatencyData } from '@/hooks/useCloudLatency';
import CloudProviderConnection from './CloudProviderConnection';
import { AlertCircle, Globe } from 'lucide-react';

interface CloudLatencyConnectionsProps {
  data: CloudLatencyData[];
  networkName: string;
}

const CloudLatencyConnections: React.FC<CloudLatencyConnectionsProps> = ({ data, networkName }) => {
  // Check if we have valid data
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6">
        <AlertCircle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
        <p>No cloud latency data available for {networkName}.</p>
      </div>
    );
  }

  // Organize data by origin (testing location)
  const originData: Record<string, CloudLatencyData[]> = data.reduce((acc, item) => {
    if (!acc[item.origin]) {
      acc[item.origin] = [];
    }
    acc[item.origin].push(item);
    return acc;
  }, {} as Record<string, CloudLatencyData[]>);

  return (
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Response times from cloud providers to {networkName} RPCs. Data collected from global testing locations.
      </p>
      
      {Object.entries(originData).map(([origin, providerData]) => (
        <div key={origin} className="mb-6 border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={18} className="text-blue-500" />
            <h3 className="font-medium">Testing Location: {origin}</h3>
          </div>
          
          <div className="space-y-3">
            {providerData
              // Sort by p50 latency (faster first)
              .sort((a, b) => a.p50_latency - b.p50_latency)
              .map((providerInfo, index) => (
                <CloudProviderConnection 
                  key={`${providerInfo.provider_name}-${index}`}
                  provider={providerInfo}
                />
              ))
            }
          </div>
        </div>
      ))}
    </div>
  );
};

export default CloudLatencyConnections;
