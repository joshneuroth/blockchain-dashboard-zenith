
import React from 'react';
import { CloudLatencyResult } from '@/hooks/blockchain/useCloudLatencyTest';
import { Server, BarChart } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CloudLatencyConnectionsProps {
  result: CloudLatencyResult;
}

const CloudLatencyConnections: React.FC<CloudLatencyConnectionsProps> = ({ result }) => {
  // Get color class based on latency
  const getLatencyColorClass = (latency: number) => {
    if (latency < 100) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (latency < 300) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };
  
  // Get success rate color class
  const getSuccessRateColorClass = (rate: number) => {
    if (rate >= 0.99) return "text-green-600 dark:text-green-400";
    if (rate >= 0.95) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };
  
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0 h-px w-32 bg-blue-400 animate-connection-pulse"></div>
      
      {/* P50 Latency box */}
      <div className={`px-3 py-1 rounded-md text-sm ${getLatencyColorClass(result.p50_latency)}`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <span className="font-medium">{result.p50_latency.toFixed(1)} ms</span>
                <BarChart size={14} className="text-gray-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <div className="font-medium mb-1">Latency Statistics</div>
                <p>P50 (median): {result.p50_latency.toFixed(1)} ms</p>
                <p>P90: {result.p90_latency.toFixed(1)} ms</p>
                <p>Success Rate: {(result.success_rate * 100).toFixed(1)}%</p>
                <p>Total Pings: {result.total_pings}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex-shrink-0 h-px w-4 bg-blue-400 animate-connection-pulse"></div>
      
      {/* Provider box */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
        <div className="text-xs text-gray-500 mb-1 flex justify-between">
          <span>Provider</span>
          <span className={getSuccessRateColorClass(result.success_rate)}>
            {(result.success_rate * 100).toFixed(1)}% up
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Server size={16} />
          <span className="text-sm font-medium">{result.provider_name}</span>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Test: {result.test_type === 'simple' ? 'Simple RPC Call' : 'Advanced Call'}
        </div>
      </div>
    </div>
  );
};

export default CloudLatencyConnections;
