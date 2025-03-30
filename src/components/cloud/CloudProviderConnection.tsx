
import React from 'react';
import { Server } from 'lucide-react';
import { CloudLatencyData } from '@/hooks/useCloudLatency';

interface CloudProviderConnectionProps {
  provider: CloudLatencyData;
  allData: CloudLatencyData[];
}

const CloudProviderConnection: React.FC<CloudProviderConnectionProps> = ({ provider, allData }) => {
  // Only calculate average if we actually have data
  const avgResponseTime = allData.length > 0 
    ? allData.reduce((sum, item) => sum + item.response_time, 0) / allData.length 
    : 0;
  
  // Get color based on response time
  const getResponseTimeColor = (time: number) => {
    if (time < 100) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (time < 300) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };

  // Count successful and failed requests with null check
  const successCount = allData.filter(item => 
    item.status >= 200 && item.status < 300
  ).length;
  
  // Calculate reliability with a safety check
  const reliability = allData.length > 0 ? (successCount / allData.length) * 100 : 0;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
      {/* Provider info */}
      <div className="flex items-center">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">Provider</div>
          <div className="flex items-center gap-2">
            <Server size={16} />
            <span className="text-sm font-medium">{provider.provider_name}</span>
          </div>
        </div>
      </div>
      
      {/* Response time data */}
      <div className="flex items-center gap-4">
        {/* Latest response time */}
        <div className={`px-4 py-2 rounded-md ${getResponseTimeColor(provider.response_time)}`}>
          <div className="text-xs opacity-80 mb-1">Latest</div>
          <div className="font-medium">{provider.response_time.toFixed(1)} ms</div>
        </div>
        
        {/* Average response time */}
        <div className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800">
          <div className="text-xs opacity-80 mb-1">Average</div>
          <div className="font-medium">{avgResponseTime.toFixed(1)} ms</div>
        </div>
        
        {/* Reliability percentage */}
        <div className="px-4 py-2 rounded-md bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          <div className="text-xs opacity-80 mb-1">Reliability</div>
          <div className="font-medium">{reliability.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

export default CloudProviderConnection;
