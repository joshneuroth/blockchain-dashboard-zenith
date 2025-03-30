
import React from 'react';
import { Server } from 'lucide-react';
import { CloudLatencyData } from '@/hooks/useCloudLatency';

interface CloudProviderConnectionProps {
  provider: CloudLatencyData;
  allData: CloudLatencyData[];
}

const CloudProviderConnection: React.FC<CloudProviderConnectionProps> = ({ provider, allData }) => {
  // Calculate average p50 latency for this provider, with safety checks
  const validLatencies = allData
    .filter(item => {
      const latency = item.p50_latency !== undefined ? item.p50_latency : item.response_time;
      return latency !== undefined && !isNaN(latency);
    })
    .map(item => item.p50_latency !== undefined ? item.p50_latency : item.response_time);
  
  const avgLatency = validLatencies.length > 0 
    ? validLatencies.reduce((sum, time) => sum + time, 0) / validLatencies.length 
    : 0;
  
  // Get the latency value to display (prioritize p50_latency)
  const latencyValue = provider.p50_latency !== undefined ? provider.p50_latency : provider.response_time;
  
  // Get color based on response time
  const getLatencyColor = (latency: number | undefined) => {
    if (latency === undefined || isNaN(latency)) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    if (latency < 100) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (latency < 300) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };

  // Format origin information in a readable way
  const formatOrigin = (origin: any): string => {
    if (!origin) return "";
    
    if (typeof origin === 'string') return origin;
    
    const parts = [];
    if (origin.host) parts.push(origin.host);
    if (origin.region) parts.push(origin.region);
    
    return parts.length > 0 ? parts.join(' - ') : "";
  };

  // Format a number with safety check
  const safeFormat = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return "N/A";
    return value.toFixed(2);
  };

  const originInfo = formatOrigin(provider.origin);

  return (
    <div className="flex items-center">
      {/* Server box - Provider */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm w-40 mr-4">
        <div className="text-xs text-gray-500 mb-1">Provider</div>
        <div className="flex items-center gap-2">
          <Server size={16} />
          <span className="text-sm font-medium">{provider.provider_name}</span>
          {originInfo && <span className="text-xs text-gray-500">({originInfo})</span>}
        </div>
      </div>
      
      <div className="flex-shrink-0 h-px w-10 bg-blue-400"></div>
      
      {/* Response time indicator */}
      <div className={`px-4 py-2 rounded-md ${getLatencyColor(latencyValue)}`}>
        <div className="text-xs opacity-80 mb-1">P50 Latency</div>
        <div className="font-medium">{safeFormat(latencyValue)} ms</div>
      </div>
      
      {/* Average response time */}
      <div className="ml-4 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800">
        <div className="text-xs opacity-80 mb-1">Average (7 days)</div>
        <div className="font-medium">{safeFormat(avgLatency)} ms</div>
      </div>
    </div>
  );
};

export default CloudProviderConnection;
