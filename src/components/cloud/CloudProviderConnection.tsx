
import React from 'react';
import { Server, Layers } from 'lucide-react';
import { CloudLatencyData } from '@/hooks/useCloudLatency';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CloudProviderConnectionProps {
  provider: CloudLatencyData;
}

const CloudProviderConnection: React.FC<CloudProviderConnectionProps> = ({ provider }) => {
  // Get color based on latency
  const getLatencyColor = (latency: number | undefined) => {
    if (latency === undefined || isNaN(latency)) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    if (latency < 100) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (latency < 300) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };

  // Format a number with safety check
  const safeFormat = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return "N/A";
    return value.toFixed(2);
  };

  // Format success rate as percentage
  const formatSuccessRate = (rate: number | undefined) => {
    if (rate === undefined || isNaN(rate)) return "N/A";
    return `${(rate * 100).toFixed(1)}%`;
  };

  return (
    <div className="flex items-center flex-wrap gap-3">
      {/* Provider box */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm w-40">
        <div className="text-xs text-gray-500 mb-1">Provider</div>
        <div className="flex items-center gap-2">
          <Server size={16} />
          <span className="text-sm font-medium">{provider.provider_name}</span>
        </div>
      </div>
      
      <div className="flex-shrink-0 h-px w-10 bg-blue-400 hidden md:block"></div>
      
      {/* P50 Latency */}
      <div className={`px-4 py-2 rounded-md ${getLatencyColor(provider.p50_latency)}`}>
        <div className="text-xs opacity-80 mb-1">P50 Latency</div>
        <div className="font-medium">{safeFormat(provider.p50_latency)} ms</div>
      </div>
      
      {/* P90 Latency */}
      <div className={`px-4 py-2 rounded-md ${getLatencyColor(provider.p90_latency)}`}>
        <div className="text-xs opacity-80 mb-1">P90 Latency</div>
        <div className="font-medium">{safeFormat(provider.p90_latency)} ms</div>
      </div>

      {/* Sample size and success rate */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center gap-2">
              <Layers size={14} />
              <span className="text-sm">{provider.sample_size} samples</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Success Rate: {formatSuccessRate(provider.success_rate)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default CloudProviderConnection;
