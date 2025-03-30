
import React from 'react';
import { Server } from 'lucide-react';
import { LatencyResult } from '@/hooks/blockchain/useLatencyTest';
import { LatencyDisplay } from './LatencyDisplay';

interface ProviderConnectionProps {
  result: LatencyResult;
}

const ProviderConnection: React.FC<ProviderConnectionProps> = ({ result }) => {
  // Get color class based on latency
  const getLatencyColorClass = (result: LatencyResult) => {
    const { latency, medianLatency, status } = result;
    const value = (medianLatency !== null) ? medianLatency : latency;
    
    if (status === 'loading') return "bg-gray-200 dark:bg-gray-700";
    if (status === 'error' || value === null) return "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    if (value < 100) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (value < 300) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };
  
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0 h-px w-32 bg-blue-400"></div>
      
      {/* Latency box */}
      <div className={`px-3 py-1 rounded-md text-sm ${getLatencyColorClass(result)}`}>
        <LatencyDisplay result={result} />
      </div>
      
      <div className="flex-shrink-0 h-px w-4 bg-blue-400"></div>
      
      {/* Server box */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
        <div className="text-xs text-gray-500 mb-1">Provider</div>
        <div className="flex items-center gap-2">
          <Server size={16} />
          <span className="text-sm font-medium">{result.provider}</span>
        </div>
      </div>
    </div>
  );
};

export default ProviderConnection;
