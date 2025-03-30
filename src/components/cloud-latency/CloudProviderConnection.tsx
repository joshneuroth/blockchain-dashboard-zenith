
import React from 'react';
import { BarChart, ExternalLink, Code } from 'lucide-react';
import { CloudLatencyResult } from '@/hooks/blockchain/useCloudLatency';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface CloudProviderConnectionProps {
  result: CloudLatencyResult;
}

const CloudProviderConnection: React.FC<CloudProviderConnectionProps> = ({ result }) => {
  // Get color class based on latency
  const getLatencyColorClass = (latency: number) => {
    if (latency < 100) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (latency < 300) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };
  
  const successRatePercentage = (result.success_rate * 100).toFixed(1);
  const successRateColor = 
    result.success_rate >= 0.98 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
    result.success_rate >= 0.9 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  
  // Shorten endpoint for display
  const shortenEndpoint = (endpoint: string) => {
    try {
      const url = new URL(endpoint);
      return url.hostname;
    } catch (e) {
      return endpoint.length > 30 ? endpoint.substring(0, 30) + '...' : endpoint;
    }
  };
  
  return (
    <div className="flex items-center animate-fade-in">
      <div className="flex-shrink-0 h-px w-32 bg-blue-400 animate-pulse-opacity"></div>
      
      {/* Latency box */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`px-3 py-1 rounded-md text-sm flex items-center gap-2 ${getLatencyColorClass(result.p50_latency)}`}>
              <span className="font-medium">{result.p50_latency.toFixed(1)} ms</span>
              <BarChart size={14} className="text-gray-500" />
              <Badge variant="outline" className={successRateColor}>{successRatePercentage}%</Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <p className="font-medium mb-1">P50 latency: {result.p50_latency.toFixed(1)} ms</p>
              <p>P90 latency: {result.p90_latency.toFixed(1)} ms</p>
              <p>Success rate: {successRatePercentage}%</p>
              <p>Total pings: {result.total_pings}</p>
              <p>Test type: {result.test_type}</p>
              <div className="flex items-center gap-1 mt-1">
                <Code size={12} />
                <p className="font-mono">{result.method}</p>
              </div>
              <p>Date: {result.date}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className="flex-shrink-0 h-px w-4 bg-blue-400"></div>
      
      {/* Endpoint box */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
        <div className="text-xs text-gray-500 mb-1">Endpoint</div>
        <div className="flex items-center gap-2">
          <ExternalLink size={16} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm font-medium truncate max-w-[180px]">
                  {shortenEndpoint(result.endpoint)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs break-all">{result.endpoint}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default CloudProviderConnection;
