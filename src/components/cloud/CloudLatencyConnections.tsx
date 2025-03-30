
import React from 'react';
import { CloudLatencyData } from '@/hooks/useCloudLatency';
import CloudProviderConnection from './CloudProviderConnection';
import { AlertCircle } from 'lucide-react';

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

  // Organize data by provider
  const providerData: Record<string, CloudLatencyData[]> = data.reduce((acc, item) => {
    if (!acc[item.provider_name]) {
      acc[item.provider_name] = [];
    }
    acc[item.provider_name].push(item);
    return acc;
  }, {} as Record<string, CloudLatencyData[]>);

  // Get the latest data point for each provider
  const latestByProvider = Object.keys(providerData).map(provider => {
    const providerItems = providerData[provider];
    // Sort by timestamp (newest first) and get the first item
    return providerItems.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  });

  // Sort providers by response time (faster first)
  const sortedProviders = latestByProvider
    .filter(provider => provider && provider.response_time !== undefined)
    .sort((a, b) => {
      // Handle undefined values in sorting
      if (a.response_time === undefined) return 1;
      if (b.response_time === undefined) return -1;
      return a.response_time - b.response_time;
    });

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Response times from cloud services to {networkName} RPCs. Data collected over the last 7 days.
      </p>
      
      <div className="space-y-3">
        {sortedProviders.map((providerInfo, index) => (
          <CloudProviderConnection 
            key={`${providerInfo.provider_name}-${index}`}
            provider={providerInfo}
            allData={providerData[providerInfo.provider_name]}
          />
        ))}
      </div>
    </div>
  );
};

export default CloudLatencyConnections;
