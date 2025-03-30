
import React from 'react';
import { Server } from 'lucide-react';
import { CloudLatencyData } from '@/hooks/useCloudLatency';

interface CloudProviderConnectionProps {
  provider: CloudLatencyData;
  allData: CloudLatencyData[];
}

const CloudProviderConnection: React.FC<CloudProviderConnectionProps> = ({ provider, allData }) => {
  // Calculate average response time for this provider, with safety checks
  const validResponseTimes = allData
    .filter(item => item.response_time !== undefined && !isNaN(item.response_time))
    .map(item => item.response_time);
  
  const avgResponseTime = validResponseTimes.length > 0 
    ? validResponseTimes.reduce((sum, time) => sum + time, 0) / validResponseTimes.length 
    : 0;
  
  // Get color based on response time
  const getResponseTimeColor = (time: number | undefined) => {
    if (time === undefined || isNaN(time)) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    if (time < 100) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (time < 300) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };

  // Format a number with safety check
  const safeFormat = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return "N/A";
    return value.toFixed(2);
  };

  return (
    <div className="flex items-center">
      {/* Server box - Provider */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm w-40 mr-4">
        <div className="text-xs text-gray-500 mb-1">Provider</div>
        <div className="flex items-center gap-2">
          <Server size={16} />
          <span className="text-sm font-medium">{provider.provider_name}</span>
        </div>
      </div>
      
      <div className="flex-shrink-0 h-px w-10 bg-blue-400"></div>
      
      {/* Response time indicator */}
      <div className={`px-4 py-2 rounded-md ${getResponseTimeColor(provider.response_time)}`}>
        <div className="text-xs opacity-80 mb-1">Latest Response Time</div>
        <div className="font-medium">{safeFormat(provider.response_time)} ms</div>
      </div>
      
      {/* Average response time */}
      <div className="ml-4 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800">
        <div className="text-xs opacity-80 mb-1">Average (7 days)</div>
        <div className="font-medium">{safeFormat(avgResponseTime)} ms</div>
      </div>
    </div>
  );
};

export default CloudProviderConnection;
